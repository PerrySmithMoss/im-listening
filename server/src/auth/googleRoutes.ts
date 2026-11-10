import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import express, { type Request, type Response } from "express";
import { validateEmail } from "../../utils/validateEmail";
import type { createMailer } from "../../utils/sendEmail";
import type { loadConfig } from "../config";
import { Prisma, type PrismaClient } from "../generated/prisma/client";
import { limitRequests, type createAuthLimiter } from "../middleware/rateLimits";
import type { RedisClient } from "../types/PrismaContext";
import { createGoogleOidc, googleIssuer, type GoogleProof } from "./googleOidc";
import { establishSession, regenerateSession, requireWriteOrigin, saveSession } from "./session";

const flowSeconds = 5 * 60;
const receiptSeconds = 60;
const codeSeconds = 10 * 60;
const onboardingSeconds = 15 * 60;
const randomProof = () => randomBytes(32).toString("base64url");
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export type GooglePending = {
  id: string;
  email: string;
  until: number;
} & (
  | { kind: "register"; subject: string; mailboxVerified: boolean; returnTo: string; entry: Entry }
  | { kind: "password"; userId: number; version: number }
);

type Entry = "/login" | "/sign-up";
type Transaction = GoogleProof & (
  | { intent: "sign-in"; returnTo: string; entry: Entry }
  | { intent: "link"; userId: number; version: number }
  | { intent: "password"; userId: number; version: number }
);

const receiptKey = (receipt: string) => `im-listening:google:return:${digest(receipt)}`;
const isProof = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);

const identityKey = (subject: string) => ({ issuer_subject: { issuer: googleIssuer, subject } });
const uniqueConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

function localReturnPath(value: unknown) {
  return typeof value === "string" && /^\/post\/[1-9][0-9]{0,9}$/.test(value) ? value : "/";
}

function pendingFor(req: Request) {
  const pending = req.session.googlePending;
  if (!pending || pending.until <= Date.now()) return undefined;
  if (pending.kind === "register") return req.session.userId ? undefined : pending;
  return req.session.userId === pending.userId && req.session.sessionVersion === pending.version
    ? pending : undefined;
}

function audit(outcome: string) {
  console.info(`Google sign-in: ${outcome}`);
}

export function googleRoutes(
  config: ReturnType<typeof loadConfig>,
  prisma: PrismaClient,
  redis: RedisClient,
  authLimit: ReturnType<typeof createAuthLimiter>,
  mailer: ReturnType<typeof createMailer>,
) {
  const router = express.Router({ caseSensitive: true, strict: true });
  const google = config.google;
  const provider = google && createGoogleOidc(google, google.redirectUri);
  const store = () => redis.withAbortSignal(AbortSignal.timeout(3000));
  const key = (req: Request, suffix: string) => `im-listening:google:${digest(req.sessionID)}:${suffix}`;
  const settings = "/account/sign-in";

  function redirect(res: Response, path: string, outcome: string) {
    audit(outcome);
    res.redirect(303, `${path}?google=${outcome}`);
  }

  router.get("/status", async (req, res) => {
    if (!provider) {
      res.json({ enabled: false });
      return;
    }
    const user = req.session.userId && await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { password: true, externalIdentities: { where: { issuer: googleIssuer }, select: { issuer: true } } },
    });
    const pending = pendingFor(req);
    res.json({
      enabled: true,
      signedIn: Boolean(user),
      hasPassword: Boolean(user && user.password),
      linked: Boolean(user && user.externalIdentities.length),
      pending: pending && {
        kind: pending.kind,
        needsCode: pending.kind === "password" || !pending.mailboxVerified,
        email: pending.email,
      },
    });
  });

  // A cross-site form POST avoids logging Google codes in proxy URLs. Redirect to a
  // top-level GET, which can carry the browser's SameSite=Lax session cookie.
  router.post("/callback", limitRequests(redis, "google-return", 40),
    express.urlencoded({ extended: false, limit: "4kb", parameterLimit: 10 }), async (req, res) => {
      if (!provider) return redirect(res, "/login", "unavailable");
      const { state, code, error, iss } = req.body ?? {};
      if (!isProof(state) || (iss !== undefined && iss !== googleIssuer) ||
          (error === "access_denied" ? code !== undefined :
            error !== undefined || typeof code !== "string" || !code || code.length > 2048)) {
        return redirect(res, "/login", "retry");
      }
      const params = new URLSearchParams({ state });
      if (iss) params.set("iss", iss);
      if (error) params.set("error", error);
      else params.set("code", code);
      const receipt = randomProof();
      await store().set(receiptKey(receipt), params.toString(), {
        expiration: { type: "EX", value: receiptSeconds },
      });
      res.redirect(303, `/api/auth/google/callback?receipt=${receipt}`);
    });

  router.use((req, res, next) => {
    if (!provider) {
      if (req.path === "/callback" && req.method === "GET") redirect(res, "/login", "unavailable");
      else res.status(404).json({ error: "Google sign-in is unavailable." });
      return;
    }
    if (req.method === "POST" && !requireWriteOrigin(req, res, config.clientOrigin)) return;
    next();
  });
  router.use(express.json({ limit: "4kb" }));

  router.post("/start", limitRequests(redis, "google-start", 20), async (req, res) => {
    const intent = req.body?.intent;
    const proof = { state: randomProof(), nonce: randomProof(), verifier: randomProof() };
    let tx: Transaction;
    if (intent === "sign-in") {
      if (req.session.userId || pendingFor(req)) {
        res.status(409).json({ error: "Finish your current sign-in or sign out before starting again." });
        return;
      }
      tx = { ...proof, intent, entry: req.body.entry === "/sign-up" ? "/sign-up" : "/login",
        returnTo: localReturnPath(req.body.returnTo) };
    } else if (intent === "link" || intent === "password") {
      const userId = req.session.userId;
      if (!userId) {
        res.status(401).json({ error: "Sign in to manage your sign-in methods." });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, sessionVersion: true, externalIdentities: {
          where: { issuer: googleIssuer }, select: { issuer: true },
        } },
      });
      if (!user || user.sessionVersion !== req.session.sessionVersion ||
          (intent === "link" ? user.externalIdentities.length : user.password || !user.externalIdentities.length)) {
        res.status(409).json({ error: "This sign-in method cannot be changed from your current session." });
        return;
      }
      if (intent === "link" && !await confirmPassword(req, userId, user.password)) {
        res.status(403).json({ error: "Enter your current password to connect Google." });
        return;
      }
      tx = { ...proof, intent, userId, version: user.sessionVersion };
    } else {
      res.status(400).json({ error: "Invalid sign-in action." });
      return;
    }
    try {
      const authorizationUrl = await provider!.authorize(tx);
      if (!req.session.userId && !req.session.googleStarted) {
        req.session.googleStarted = true;
        await saveSession(req);
      }
      await store().set(key(req, tx.state), JSON.stringify(tx), { expiration: { type: "EX", value: flowSeconds } });
      audit(`${intent} started`);
      res.json({ authorizationUrl });
    } catch {
      audit("start unavailable");
      res.status(503).json({ error: "Google sign-in is temporarily unavailable. Please try again." });
    }
  });

  router.get("/callback", limitRequests(redis, "google-callback", 40), async (req, res) => {
    let destination = "/login";
    const originalSessionId = req.sessionID;
    const completionKey = key(req, "completed");
    let ownsCompletion = false;
    try {
      const receipt = req.query.receipt;
      if ((!req.session.googleStarted && !req.session.userId) || !isProof(receipt) ||
          Object.keys(req.query).length !== 1) {
        return redirect(res, destination, "retry");
      }
      const response = await store().get(receiptKey(receipt));
      if (!response) return redirect(res, destination, "retry");
      const params = new URLSearchParams(response);
      const state = params.get("state");
      if (!isProof(state)) return redirect(res, destination, "retry");
      const raw = await store().getDel(key(req, state));
      if (!raw) return redirect(res, destination, "retry");
      await store().del(receiptKey(receipt));
      const tx: Transaction = JSON.parse(raw);
      destination = tx.intent === "sign-in" ? tx.entry : settings;
      if (params.get("error") === "access_denied" && !params.has("code")) {
        return redirect(res, destination, "cancelled");
      }
      if (tx.intent === "sign-in" ? req.session.userId || pendingFor(req) :
          tx.userId !== req.session.userId || tx.version !== req.session.sessionVersion) {
        return redirect(res, destination, "retry");
      }

      const callback = new Request(google!.redirectUri, { method: "POST", body: params });
      const claims = await provider!.exchange(callback, tx);
      // Different states may complete concurrently for the same old session. Only one may
      // change the session or account. A cancelled or invalid provider response takes no slot.
      ownsCompletion = !!await store().set(completionKey, "1", {
        condition: "NX", expiration: { type: "EX", value: flowSeconds * 2 },
      });
      if (!ownsCompletion) return redirect(res, destination, "retry");

      const identity = identityKey(claims.sub);
      if (tx.intent === "link") {
        try {
          const version = await prisma.$transaction(async (db) => {
            const updated = await db.user.updateMany({
              where: { id: tx.userId, sessionVersion: tx.version, password: { not: null } },
              data: { sessionVersion: { increment: 1 } },
            });
            if (!updated.count) return undefined;
            await db.externalIdentity.create({ data: { ...identity.issuer_subject, userId: tx.userId } });
            return tx.version + 1;
          });
          if (version === undefined) return redirect(res, settings, "retry");
          await establishSession(req, tx.userId, version);
          return redirect(res, settings, "linked");
        } catch (error) {
          if (uniqueConflict(error)) return redirect(res, settings, "link-failed");
          throw error;
        }
      }

      const linked = await prisma.externalIdentity.findUnique({
        where: identity,
        select: { user: { select: { id: true, email: true, password: true, sessionVersion: true } } },
      });
      if (tx.intent === "password") {
        const user = linked?.user;
        if (!user || user.id !== tx.userId || user.sessionVersion !== tx.version || user.password) {
          return redirect(res, settings, "password-failed");
        }
        await establishSession(req, user.id, tx.version);
        req.session.googlePending = {
          kind: "password", id: randomProof(), email: user.email,
          userId: user.id, version: tx.version, until: Date.now() + codeSeconds * 1000,
        };
        await saveSession(req);
        return redirect(res, settings, "verify");
      }

      if (linked) {
        await establishSession(req, linked.user.id, linked.user.sessionVersion);
        audit("signed in");
        res.redirect(303, tx.returnTo);
        return;
      }
      const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
      if (claims.email_verified !== true || !validateEmail(email) || email.length > 190) {
        return redirect(res, destination, "email-unverified");
      }
      const mailboxVerified = email.endsWith("@gmail.com") || (typeof claims.hd === "string" && Boolean(claims.hd));
      await regenerateSession(req);
      req.session.googlePending = {
        kind: "register", id: randomProof(), subject: claims.sub, email, mailboxVerified,
        until: Date.now() + onboardingSeconds * 1000, returnTo: tx.returnTo, entry: tx.entry,
      };
      await saveSession(req);
      return redirect(res, "/google-onboarding", "onboarding");
    } catch {
      return redirect(res, destination, "retry");
    } finally {
      if (ownsCompletion && originalSessionId === req.sessionID) {
        await store().del(completionKey).catch(() => audit("completion release unavailable"));
      }
    }
  });

  router.post("/email-code", limitRequests(redis, "google-email", 10), async (req, res) => {
    const pending = pendingFor(req);
    if (!pending || (pending.kind === "register" && pending.mailboxVerified)) {
      res.status(409).json({ error: "Start Google sign-in again to verify your email." });
      return;
    }
    if (!mailer) {
      res.status(503).json({ error: "Email verification is temporarily unavailable." });
      return;
    }
    await authLimit("googleEmail", req.ip!, pending.email);
    const code = randomInt(100_000_000).toString().padStart(8, "0");
    const challenge = key(req, `email:${pending.id}`);
    await store().set(challenge, digest(code), { expiration: { type: "EX", value: codeSeconds } });
    try {
      await mailer.sendVerification(pending.email, code);
      audit("verification sent");
      res.json({ sent: true });
    } catch {
      audit("verification unavailable");
      res.status(503).json({ error: "Could not send a code. Please try again." });
    }
  });

  async function confirmedEmail(req: Request, pending: GooglePending) {
    if (pending.kind === "register" && pending.mailboxVerified) return true;
    await authLimit("googleCode", req.ip!, pending.id);
    const code: unknown = req.body?.code;
    if (typeof code !== "string" || !/^\d{8}$/.test(code)) return false;
    const expected = await store().get(key(req, `email:${pending.id}`));
    return !!expected && timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(digest(code), "hex"));
  }

  router.post("/register", limitRequests(redis, "google-register", 15), async (req, res) => {
    const pending = pendingFor(req);
    if (pending?.kind !== "register") {
      res.status(409).json({ error: "This registration expired. Please start again." });
      return;
    }
    const firstName = typeof req.body?.firstName === "string" ? req.body.firstName.trim() : "";
    const lastName = typeof req.body?.lastName === "string" ? req.body.lastName.trim() : "";
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80 ||
        !username || username.length > 40 || /\s/u.test(username)) {
      res.status(400).json({ error: "Enter your first and last name (up to 80 characters each) and a username (up to 40 characters, no spaces)." });
      return;
    }
    if (!await confirmedEmail(req, pending)) {
      res.status(403).json({ error: "The verification code is incorrect or has expired." });
      return;
    }
    try {
      const user = await prisma.user.create({
        data: {
          firstName, lastName, username, email: pending.email,
          profile: { create: {} },
          externalIdentities: { create: { issuer: googleIssuer, subject: pending.subject } },
        },
        select: { id: true, sessionVersion: true },
      });
      await establishSession(req, user.id, user.sessionVersion);
      audit("registered");
      res.json({ next: pending.returnTo });
    } catch (error) {
      if (!uniqueConflict(error)) throw error;
      const nameTaken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      audit("registration conflict");
      res.status(409).json({ error: nameTaken ? "This username is unavailable." :
        "Could not create an account with Google. If you already use Im Listening, sign in with your existing method and connect Google from your account." });
    }
  });

  async function confirmPassword(req: Request, userId: number, hash: string | null) {
    await authLimit("googleManage", req.ip!, String(userId));
    const password: unknown = req.body?.password;
    return Boolean(hash && typeof password === "string" && password.length > 0 &&
      password.length <= 128 && await argon2.verify(hash, password));
  }

  router.post("/unlink", limitRequests(redis, "google-unlink", 10), async (req, res) => {
    const id = req.session.userId;
    if (!id) {
      res.status(401).json({ error: "Sign in to manage your sign-in methods." });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true, sessionVersion: true, externalIdentities: {
        where: { issuer: googleIssuer }, select: { issuer: true },
      } },
    });
    if (!user?.externalIdentities.length) {
      res.status(409).json({ error: "Google is already disconnected." });
      return;
    }
    if (!user.password || user.sessionVersion !== req.session.sessionVersion ||
        !await confirmPassword(req, id, user.password)) {
      audit("unlink denied");
      res.status(403).json({ error: "Set up and confirm a password before disconnecting Google." });
      return;
    }
    const removed = await prisma.$transaction(async (db) => {
      const updated = await db.user.updateMany({
        where: { id, sessionVersion: user.sessionVersion, password: { not: null } },
        data: { sessionVersion: { increment: 1 } },
      });
      if (!updated.count) return false;
      await db.externalIdentity.deleteMany({ where: { userId: id, issuer: googleIssuer } });
      return true;
    });
    if (!removed) {
      res.status(409).json({ error: "Your sign-in methods changed. Sign in again and retry." });
      return;
    }
    await establishSession(req, id, user.sessionVersion + 1);
    audit("unlinked");
    res.json({ removed: true });
  });

  router.post("/password", limitRequests(redis, "google-password", 10), async (req, res) => {
    const pending = pendingFor(req);
    if (pending?.kind !== "password") {
      res.status(409).json({ error: "Verify your Google account again to set a password." });
      return;
    }
    const password: unknown = req.body?.password;
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: "Use a password between 8 and 128 characters." });
      return;
    }
    if (!await confirmedEmail(req, pending)) {
      res.status(403).json({ error: "The verification code is incorrect or has expired." });
      return;
    }
    const updated = await prisma.user.updateMany({
      where: { id: pending.userId, sessionVersion: pending.version, password: null, email: pending.email },
      data: { password: await argon2.hash(password), sessionVersion: { increment: 1 } },
    });
    if (!updated.count) {
      res.status(409).json({ error: "Your sign-in methods changed. Sign in again and retry." });
      return;
    }
    await establishSession(req, pending.userId, pending.version + 1);
    audit("password set");
    res.json({ saved: true });
  });

  router.post("/cancel", limitRequests(redis, "google-cancel", 15), async (req, res) => {
    const pending = pendingFor(req);
    if (pending?.kind === "password") {
      await establishSession(req, pending.userId, pending.version);
    } else if (!req.session.userId) {
      await regenerateSession(req);
    }
    res.json({ next: pending?.kind === "register" ? pending.entry : settings });
  });

  return router;
}
