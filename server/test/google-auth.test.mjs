import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, generateKeyPairSync, randomBytes, randomUUID, sign } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "redis";
import { SMTPServer } from "smtp-server";
import { PrismaClient } from "../dist/src/generated/prisma/client.js";
import { claimGoogleCompletion, logoutSession } from "../dist/src/auth/googleCompletion.js";
import { loadConfig } from "../dist/src/config.js";

const origin = "http://localhost:3100";
const api = "http://127.0.0.1:5052";
const callback = "/api/auth/google/callback";
const issuer = "https://accounts.google.com";
const clientId = "mock-client";
const clientSecret = "mock-secret";
const proxySecret = randomBytes(32).toString("hex");
const password = "test account password";
const testRun = randomUUID().slice(0, 8);
const challenge = (verifier) => createHash("sha256").update(verifier).digest("base64url");
const hash = (value) => createHash("sha256").update(value).digest("hex");

function signingKey(kid) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return { jwk: { ...publicKey.export({ format: "jwk" }), kid, alg: "RS256" }, privateKey };
}

function mockGoogle() {
  const grants = new Map();
  const key = signingKey("initial");
  const forged = signingKey("forged");
  let activeKey = key;
  let useOffset = false;
  let discoveryDown = true;
  let pkceSupported = true;
  let jwksReads = 0;
  let exchanges = 0;

  const server = createServer(async (req, res) => {
    res.setHeader("content-type", "application/json");
    const reply = (data, status = 200) => {
      res.writeHead(status);
      res.end(JSON.stringify(data));
    };
    if (req.url === "/discovery") {
      if (discoveryDown) return reply({}, 503);
      return reply({
        issuer,
        authorization_endpoint: issuer + "/o/oauth2/v2/auth",
        token_endpoint: "https://oauth2.googleapis.com/token",
        jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
        code_challenge_methods_supported: pkceSupported ? ["S256"] : ["plain"],
        id_token_signing_alg_values_supported: ["RS256"],
        authorization_response_iss_parameter_supported: true,
      });
    }
    if (req.url === "/jwks") {
      jwksReads++;
      return reply({ keys: [activeKey.jwk] });
    }
    if (req.url !== "/token") return reply({}, 404);
    exchanges++;
    let body = "";
    for await (const chunk of req) body += chunk;
    const params = new URLSearchParams(body);
    const code = params.get("code");
    const grant = grants.get(code);
    grants.delete(code);
    if (!grant || grant.badPkce || params.get("client_id") !== clientId ||
        params.get("client_secret") !== clientSecret || params.get("grant_type") !== "authorization_code" ||
        params.get("redirect_uri") !== origin + callback ||
        challenge(params.get("code_verifier") ?? "") !== grant.challenge) {
      return reply({ error: "invalid_grant" }, 400);
    }
    if (grant.down) return reply({}, 503);
    if (useOffset) res.setHeader("x-test-clock-offset", "61000");
    const now = Math.floor(Date.now() / 1000) + (useOffset ? 61 : 0);
    const claims = {
      iss: issuer, sub: "google-default-" + testRun, aud: clientId, iat: now, exp: now + 300,
      email: `${testRun}@gmail.com`, email_verified: true, nonce: grant.nonce,
      ...grant.claims,
    };
    const encode = (data) => Buffer.from(JSON.stringify(data)).toString("base64url");
    const input = `${encode({ alg: grant.algorithm ?? "RS256", kid: activeKey.jwk.kid })}.${encode(claims)}`;
    const signature = sign("RSA-SHA256", Buffer.from(input), grant.forged ? forged.privateKey : activeKey.privateKey);
    return reply({
      access_token: "unused-test-access-token", token_type: "Bearer", id_token: `${input}.${signature.toString("base64url")}`,
    });
  });
  return {
    server,
    get exchanges() { return exchanges; },
    get jwksReads() { return jwksReads; },
    enableDiscovery() { discoveryDown = false; },
    setPkce(supported) { pkceSupported = supported; },
    rotate() { activeKey = signingKey("rotated"); useOffset = true; },
    form(url, options = {}) {
      const state = url.searchParams.get("state");
      if (options.cancel) return new URLSearchParams({ state, iss: issuer, error: "access_denied" });
      const code = randomUUID();
      grants.set(code, { nonce: url.searchParams.get("nonce"), challenge: url.searchParams.get("code_challenge"), ...options });
      return new URLSearchParams({ state, iss: issuer, code });
    },
  };
}

let browserIndex = randomBytes(2).readUInt16BE();
function browser(initialCookie = "") {
  let cookie = initialCookie;
  const ip = `203.${(browserIndex >> 8) & 255}.${browserIndex++ & 255}.1`;
  return {
    get cookie() { return cookie; },
    async request(path, { method = "GET", body, sendCookie = true, requestOrigin = origin, throughProxy = true } = {}) {
      const isGoogle = path.startsWith("/api/auth/google/");
      const response = await fetch(api + path.replace(/^\/api\//, "/"), {
        method,
        redirect: "manual",
        headers: {
          "x-forwarded-for": isGoogle ? "192.0.2.10" : ip,
          "x-forwarded-proto": "https",
          ...(isGoogle && throughProxy && {
            authorization: `Bearer ${proxySecret}`, "x-im-listening-client-ip": ip,
          }),
          ...(requestOrigin && { origin: requestOrigin }),
          ...(sendCookie && cookie && { cookie }),
          ...(body && !(body instanceof URLSearchParams) && { "content-type": "application/json" }),
        },
        body: body instanceof URLSearchParams ? body : body && JSON.stringify(body),
      });
      const issued = response.headers.getSetCookie().at(-1);
      if (issued) cookie = issued.split(";", 1)[0];
      return response;
    },
    async post(path, body, expected = 200) {
      const response = await this.request("/api/auth/google/" + path, { method: "POST", body });
      const data = await response.json();
      assert.equal(response.status, expected, JSON.stringify(data));
      return data;
    },
    async start(fields = {}) {
      const { authorizationUrl } = await this.post("start", { intent: "sign-in", ...fields });
      const url = new URL(authorizationUrl);
      assert.equal(url.origin, issuer);
      assert.equal(url.searchParams.get("redirect_uri"), origin + callback);
      assert.equal(url.searchParams.get("scope"), "openid email");
      assert.equal(url.searchParams.get("response_type"), "code");
      assert.equal(url.searchParams.get("response_mode"), "form_post");
      assert.equal(url.searchParams.get("prompt"), "select_account");
      assert.equal(url.searchParams.get("code_challenge_method"), "S256");
      assert.equal(url.searchParams.has("access_type"), false);
      return url;
    },
    async receive(form) {
      const response = await this.request(callback, {
        method: "POST", body: form, sendCookie: false, requestOrigin: issuer,
      });
      assert.equal(response.status, 303);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      const location = response.headers.get("location");
      assert.match(location, /^\/api\/auth\/google\/callback\?receipt=[A-Za-z0-9_-]{43}$/);
      return location;
    },
    async complete(receipt) {
      const response = await this.request(receipt, { requestOrigin: "" });
      assert.equal(response.status, 303);
      assert.equal(response.headers.get("cache-control"), "no-store");
      return response;
    },
    async graphql(query, variables) {
      const response = await this.request("/graphql", { method: "POST", body: { query, variables } });
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.errors, undefined, JSON.stringify(result.errors));
      return result.data;
    },
    async user() {
      return (await this.graphql("{ getCurrentUser { id email username } }")).getCurrentUser;
    },
  };
}

const login = `mutation($email: String!, $password: String!) {
  loginUser(email: $email, password: $password) { user { id } errors { field } }
}`;
const logout = "mutation { logoutUser }";
const reset = `mutation($email: String!) { forgotPassword(email: $email) }`;
const fields = { firstName: "Test", lastName: "Listener", username: `google-${testRun}` };

test("Google OIDC integration with real PostgreSQL, Redis and an isolated provider", { timeout: 45_000 }, async (t) => {
  const database = new URL(process.env.DATABASE_URL);
  const redisUrl = new URL(process.env.REDIS_URL);
  assert.equal(database.hostname, "127.0.0.1");
  assert.equal(redisUrl.hostname, "127.0.0.1");
  redisUrl.pathname = "/10";
  const redis = createClient({ url: redisUrl.href });
  await redis.connect();
  const aclUser = `google-test-${testRun}`;
  const aclPassword = randomBytes(24).toString("hex");
  await redis.sendCommand(["ACL", "SETUSER", aclUser, "on", `>${aclPassword}`, "~*", "+@all"]);
  t.after(async () => {
    try {
      await redis.sendCommand(["ACL", "DELUSER", aclUser]);
    } finally {
      await redis.close();
    }
  });
  redisUrl.username = aclUser;
  redisUrl.password = aclPassword;

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: database.href }) });
  const originalEmail = `${testRun}-password@example.test`;
  const original = await prisma.user.create({ data: {
    ...fields, username: `${fields.username}-original`, email: originalEmail,
    password: await (await import("argon2")).default.hash(password),
  } });
  t.after(async () => {
    try {
      await prisma.user.deleteMany({ where: { username: { in: [
        original.username, fields.username, fields.username + "-external",
      ] } } });
    } finally {
      await prisma.$disconnect();
    }
  });

  const google = mockGoogle();
  google.server.listen(0, "127.0.0.1");
  await once(google.server, "listening");
  t.after(() => google.server.close());
  const inbox = [];
  const smtp = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS"],
    disableReverseLookup: true,
    onData(stream, session, done) {
      let contents = "";
      stream.on("data", (chunk) => { contents += chunk; });
      stream.on("end", () => {
        inbox.push({ to: session.envelope.rcptTo[0].address, contents });
        done();
      });
    },
  });
  const smtpListening = once(smtp.server, "listening");
  smtp.listen(0, "127.0.0.1");
  await smtpListening;
  t.after(() => new Promise((resolve) => smtp.close(resolve)));
  const env = {
    ...process.env,
    NODE_ENV: "test", HOST: "127.0.0.1", PORT: "5052", CLIENT_ORIGIN: origin, COOKIE_SAME_SITE: "lax",
    TRUST_PROXY_HOPS: "1", REDIS_URL: redisUrl.href,
    GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, GOOGLE_PROXY_SECRET: proxySecret,
    TEST_GOOGLE_URL: `http://127.0.0.1:${google.server.address().port}`,
    SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.server.address().port),
    SMTP_FROM: "test@localhost", SMTP_SECURE: "false", SMTP_USER: "", SMTP_PASSWORD: "",
  };
  const child = spawn(process.execPath, [
    "--import", "./test/fixtures/google-transport.mjs", "dist/src/index.js",
  ], { env, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", (chunk) => { logs += chunk; });
  child.stderr.on("data", (chunk) => { logs += chunk; });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
    }
  });
  for (let attempt = 0; !logs.includes("API listening") && attempt < 60; attempt++) await delay(100);
  assert.match(logs, /API listening/, logs);

  async function authorize(b, options = {}, fields = {}) {
    return b.complete(await b.receive(google.form(await b.start(fields), options)));
  }

  function latestCode(email) {
    const message = inbox.findLast(({ to }) => to === email);
    assert.ok(message);
    return message.contents.match(/verification code is (\d{8})/)[1];
  }

  const gmail = `${testRun}@gmail.com`;

  await t.test("logout serializes with Google session rotation and revokes its successor", async () => {
    const original = `test-original-${testRun}`;
    const successor = `test-successor-${testRun}`;
    await redis.set(`im-listening:sess:${original}`, "{}", { expiration: { type: "EX", value: 60 } });
    const release = await claimGoogleCompletion(redis, original);
    assert.equal(typeof release, "function");
    assert.equal(await claimGoogleCompletion(redis, original), undefined);
    const loggedOut = logoutSession({ sessionID: original, session: { destroy: (done) => done() } }, redis);
    assert.equal(await Promise.race([loggedOut.then(() => "finished"), delay(75, "waiting")]), "waiting");

    await redis.del(`im-listening:sess:${original}`);
    await redis.set(`im-listening:sess:${successor}`, "{}", { expiration: { type: "EX", value: 60 } });
    await release(successor);
    await loggedOut;
    assert.equal(await claimGoogleCompletion(redis, original), undefined);
    assert.equal(await claimGoogleCompletion(redis, successor), undefined);
  });
  let googleUser;
  await t.test("fail closed during discovery, missing PKCE, provider and Redis failures", async () => {
    const b = browser();
    await b.post("start", { intent: "sign-in" }, 503);
    google.enableDiscovery();
    google.setPkce(false);
    await b.post("start", { intent: "sign-in" }, 503);
    google.setPkce(true);
    assert.equal((await authorize(b, { down: true })).headers.get("location"), "/login?google=retry");
    const receipt = await b.receive(google.form(await b.start()));
    await redis.sendCommand(["ACL", "SETUSER", aclUser, "-getdel"]);
    try {
      assert.equal((await b.complete(receipt)).headers.get("location"), "/login?google=retry");
      assert.equal(await b.user(), null);
    } finally {
      await redis.sendCommand(["ACL", "SETUSER", aclUser, "+getdel"]);
    }
  });

  await t.test("Google rate limits separate authenticated client addresses behind one proxy", async () => {
    const b = browser();
    const start = "/api/auth/google/start";
    const direct = await b.request(start, { method: "POST", body: { intent: "sign-in" }, throughProxy: false });
    assert.equal(direct.status, 403);
    for (let attempt = 0; attempt < 20; attempt++) await b.post("start", {}, 400);
    assert.equal((await b.request(start, { method: "POST", body: {} })).status, 429);
    await browser().start();
  });

  await t.test("origin, state, expiry, browser binding and login CSRF", async () => {
    const b = browser();
    const denied = await b.request("/auth/google/start", {
      method: "POST", body: { intent: "sign-in" }, requestOrigin: "https://unrelated.test",
    });
    assert.equal(denied.status, 403);
    assert.equal((await b.complete(callback)).headers.get("location"), "/login?google=retry");
    const wrongState = google.form(await b.start());
    wrongState.set("state", "A".repeat(43));
    assert.equal((await b.complete(await b.receive(wrongState))).headers.get("location"), "/login?google=retry");
    const url = await b.start();
    const receipt = await b.receive(google.form(url));
    const another = browser();
    await another.start();
    const count = google.exchanges;
    assert.equal((await another.complete(receipt)).headers.get("location"), "/login?google=retry");
    assert.equal(google.exchanges, count);
    assert.equal(await another.user(), null);
    const signedId = decodeURIComponent(b.cookie.split("=")[1]).slice(2).split(".")[0];
    const state = url.searchParams.get("state");
    assert.equal(await redis.expire(`im-listening:google:${hash(signedId)}:${state}`, 0), 1);
    assert.equal((await b.complete(await b.receive(google.form(url)))).headers.get("location"), "/login?google=retry");
  });

  await t.test("reject forged, expired or invalid ID tokens, issuer, audience, nonce and PKCE", async () => {
    const now = Math.floor(Date.now() / 1000);
    for (const invalid of [
      { forged: true }, { algorithm: "RS512" }, { badPkce: true }, { claims: { exp: now - 120 } },
      { claims: { iat: now + 120 } }, { claims: { iat: now - 400 } },
      { claims: { iss: "https://issuer.test" } }, { claims: { aud: "another-client" } },
      { claims: { aud: [clientId, "another-client"] } }, { claims: { azp: "another-client" } },
      { claims: { nonce: "wrong-nonce" } },
    ]) {
      const b = browser();
      assert.equal((await authorize(b, invalid)).headers.get("location"), "/login?google=retry", JSON.stringify(invalid));
      assert.equal(await b.user(), null);
    }
    const b = browser();
    assert.equal((await authorize(b, { claims: { email_verified: false } })).headers.get("location"), "/login?google=email-unverified");
  });

  await t.test("register, handle required fields and username collision, regenerate and log out", async () => {
    const b = browser();
    const response = await authorize(b, {}, { returnTo: "/post/42", entry: "/sign-up" });
    assert.equal(response.headers.get("location"), "/google-onboarding?google=onboarding");
    assert.match(response.headers.get("set-cookie"), /Path=\/; Expires=.*; HttpOnly; SameSite=Lax/i);
    const pendingCookie = b.cookie;
    assert.equal(await b.user(), null);
    await b.post("register", { username: fields.username }, 400);
    assert.match((await b.post("register", { ...fields, username: original.username }, 409)).error, /username/);
    assert.equal((await b.post("register", fields)).next, "/post/42");
    assert.notEqual(b.cookie, pendingCookie);
    assert.equal(await browser(pendingCookie).user(), null);
    googleUser = await b.user();
    assert.equal(googleUser.email, gmail);
    assert.equal((await prisma.user.findUnique({ where: { email: gmail } })).password, null);
    await b.graphql(logout);
    assert.equal(await b.user(), null);
  });

  await t.test("return by subject, ignore changed email, reject replay and open redirects", async () => {
    const b = browser();
    const start = await b.start({ returnTo: "//unrelated.test" });
    const oldCookie = b.cookie;
    const form = google.form(start, { claims: { email: originalEmail, email_verified: false } });
    const receipts = await Promise.all([b.receive(form), b.receive(form)]);
    const replies = await Promise.all(receipts.map((receipt) => b.complete(receipt)));
    assert.deepEqual(replies.map((reply) => reply.headers.get("location")).sort(), ["/", "/login?google=retry"]);
    assert.equal(replies.filter((reply) => reply.headers.has("set-cookie")).length, 1);
    assert.notEqual(b.cookie, oldCookie);
    assert.equal(await browser(oldCookie).user(), null);
    assert.equal((await b.user()).email, gmail);
    assert.equal((await b.complete(receipts[0])).headers.get("location"), "/login?google=retry");
    await browser(oldCookie).graphql(logout);
    assert.equal(await b.user(), null);
  });

  await t.test("concurrent starts and cancellation preserve other transactions", async () => {
    const b = browser();
    const cancelled = await b.start({ entry: "/sign-up", returnTo: "/post/42" });
    const [first, second] = await Promise.all([b.start(), b.start()]);
    assert.notEqual(first.searchParams.get("state"), second.searchParams.get("state"));
    const cancelledAt = new URL((await b.complete(await b.receive(google.form(cancelled, { cancel: true })))).headers.get("location"), origin);
    assert.equal(cancelledAt.pathname, "/sign-up");
    assert.equal(cancelledAt.searchParams.get("google"), "cancelled");
    const receipts = await Promise.all([b.receive(google.form(first)), b.receive(google.form(second))]);
    const replies = await Promise.all(receipts.map((receipt) => b.complete(receipt)));
    assert.deepEqual(replies.map((reply) => reply.headers.get("location")).sort(), ["/", "/login?google=retry"]);
    assert.equal(replies.filter((reply) => reply.headers.has("set-cookie")).length, 1);
    const retryBrowser = browser();
    const retry = await retryBrowser.start({ returnTo: cancelledAt.searchParams.get("next") });
    assert.equal((await retryBrowser.complete(await retryBrowser.receive(google.form(retry)))).headers.get("location"), "/post/42");
  });

  await t.test("third-party email verification and no email-based account takeover", async () => {
    const b = browser();
    const email = `${testRun}-external@example.test`;
    assert.equal((await authorize(b, { claims: { email, sub: "non-google-mailbox" + testRun } })).headers.get("location"),
      "/google-onboarding?google=onboarding");
    await b.post("register", { ...fields, username: fields.username + "-external", code: "00000000" }, 403);
    await b.post("email-code", {});
    await b.post("register", { ...fields, username: fields.username + "-external", code: latestCode(email) });
    assert.equal((await b.user()).email, email);

    const collision = browser();
    await authorize(collision, { claims: { email: originalEmail, sub: "matching-email" + testRun } });
    await collision.post("email-code", {});
    await collision.post("register", { ...fields, username: fields.username + "-collision", code: latestCode(originalEmail) }, 409);
    assert.equal(await collision.user(), null);
    assert.equal(await prisma.externalIdentity.findUnique({
      where: { issuer_subject: { issuer, subject: "matching-email" + testRun } },
    }), null);
  });

  await t.test("explicit linking and unlinking require the local password and invalidate old sessions", async () => {
    const b = browser();
    await b.graphql(login, { email: originalEmail, password });
    const oldCookie = b.cookie;
    await b.post("start", { intent: "link", password: "wrong" }, 403);
    const alreadyLinked = await b.start({ intent: "link", password });
    assert.equal((await b.complete(await b.receive(google.form(alreadyLinked)))).headers.get("location"),
      "/account/sign-in?google=link-failed");
    const subject = "explicit-link-" + testRun;
    const linked = await authorize(b, { claims: { sub: subject, email: gmail } }, { intent: "link", password });
    assert.equal(linked.headers.get("location"), "/account/sign-in?google=linked");
    assert.equal(await browser(oldCookie).user(), null);
    assert.equal((await b.user()).email, originalEmail);
    const viaGoogle = browser();
    await authorize(viaGoogle, { claims: { sub: subject } });
    assert.equal((await viaGoogle.user()).id, String(original.id));
    const denied = await b.request("/auth/google/unlink", {
      method: "POST", body: { password }, requestOrigin: "",
    });
    assert.equal(denied.status, 403);
    await b.post("unlink", { password: "wrong" }, 403);
    await b.post("unlink", { password });
    assert.equal(await viaGoogle.user(), null);
    assert.equal((await b.user()).id, String(original.id));
  });

  await t.test("Google-only password reset cannot enable passwords; setup requires Google and mailbox proof", async () => {
    const b = browser();
    const emailCount = inbox.length;
    await b.graphql(reset, { email: gmail });
    assert.equal((await b.graphql(login, { email: gmail, password })).loginUser.user, null);
    await authorize(b);
    await b.post("unlink", { password }, 403);
    await b.post("password", { password }, 409);
    const wrong = await authorize(b, { claims: { sub: "wrong-account" } }, { intent: "password" });
    assert.equal(wrong.headers.get("location"), "/account/sign-in?google=password-failed");
    assert.equal(inbox.length, emailCount);
    const confirmation = await authorize(b, {}, { intent: "password" });
    assert.equal(confirmation.headers.get("location"), "/account/sign-in?google=verify");
    await b.post("password", { password }, 403);
    await b.post("email-code", {});
    await b.post("password", { password, code: latestCode(gmail) });
    const passwordBrowser = browser();
    assert.equal((await passwordBrowser.graphql(login, { email: gmail, password })).loginUser.user.id, googleUser.id);
  });

  await t.test("JWKS cache refreshes for a rotated key and session idle/absolute expiry is enforced", async () => {
    const before = google.jwksReads;
    assert.equal(before, 1);
    google.rotate();
    const b = browser();
    assert.equal((await authorize(b)).headers.get("location"), "/");
    assert.equal(google.jwksReads, before + 1);
    const id = decodeURIComponent(b.cookie.split("=")[1]).slice(2).split(".")[0];
    const sessionKey = "im-listening:sess:" + id;
    const saved = JSON.parse(await redis.get(sessionKey));
    assert.ok(await redis.ttl(sessionKey) <= 24 * 3600);
    assert.ok(await redis.ttl(sessionKey) > 23 * 3600);
    saved.authenticatedAt -= 7 * 24 * 3600 * 1000;
    await redis.set(sessionKey, JSON.stringify(saved), { expiration: { type: "EX", value: 60 } });
    assert.equal(await b.user(), null);
    await authorize(b);
    const nextId = decodeURIComponent(b.cookie.split("=")[1]).slice(2).split(".")[0];
    await redis.expire("im-listening:sess:" + nextId, 0);
    assert.equal(await b.user(), null);
  });
  assert.doesNotMatch(logs, /unused-test-access-token|mock-secret|@gmail\.com|code_verifier|access_denied/);
});

test("production requires a Google client and uses the exact HTTPS callback and host-only Lax cookie", () => {
  const previous = { ...process.env };
  try {
    Object.assign(process.env, {
      NODE_ENV: "production", CLIENT_ORIGIN: "https://im-listening.vercel.app", COOKIE_SAME_SITE: "lax",
      GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret,
      GOOGLE_PROXY_SECRET: proxySecret,
      SMTP_HOST: "smtp.example.test", SMTP_FROM: "test@example.test",
    });
    const config = loadConfig();
    assert.equal(config.google.redirectUri, "https://im-listening.vercel.app/api/auth/google/callback");
    assert.equal(config.cookieName, "__Host-im-listening");
    assert.deepEqual(config.cookie, { secure: true, path: "/", httpOnly: true, sameSite: "lax" });
    delete process.env.GOOGLE_PROXY_SECRET;
    assert.throws(loadConfig, /GOOGLE_PROXY_SECRET/);
    process.env.GOOGLE_PROXY_SECRET = "invalid-credential-".repeat(4);
    assert.throws(loadConfig, /GOOGLE_PROXY_SECRET must be a 64-character hexadecimal value/);
    process.env.GOOGLE_PROXY_SECRET = proxySecret;
    delete process.env.GOOGLE_CLIENT_SECRET;
    assert.throws(loadConfig, /GOOGLE_CLIENT_SECRET/);
    delete process.env.GOOGLE_CLIENT_ID;
    assert.throws(loadConfig, /GOOGLE_CLIENT_ID/);
    process.env.NODE_ENV = "test";
    assert.equal(loadConfig().google, undefined);
    process.env.GOOGLE_CLIENT_ID = clientId;
    assert.throws(loadConfig, /GOOGLE_CLIENT_SECRET/);
    process.env.NODE_ENV = "production";
    process.env.GOOGLE_CLIENT_SECRET = clientSecret;
    process.env.COOKIE_SAME_SITE = "none";
    assert.throws(loadConfig, /SameSite=Lax/);
    process.env.CLIENT_ORIGIN = "http://im-listening.vercel.app";
    assert.throws(loadConfig, /HTTPS/);
  } finally {
    process.env = previous;
  }
});
