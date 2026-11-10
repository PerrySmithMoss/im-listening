import { isIP } from "node:net";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: false }, maxDuration: 30 };

const actions = new Set(["status", "start", "callback", "email-code", "register", "unlink", "password", "cancel"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  const { action } = req.query;
  const upstream = process.env.GRAPHQL_INTERNAL_URL;
  if (process.env.NEXT_PUBLIC_GRAPHQL_API_URL !== "/api/graphql" || !upstream ||
      typeof action !== "string" || !actions.has(action)) {
    return res.status(404).json({ error: "Google sign-in is unavailable." });
  }

  const method = req.method;
  const allowed = action === "callback" ? ["GET", "POST"] : [action === "status" ? "GET" : "POST"];
  if (!method || !allowed.includes(method)) {
    res.setHeader("Allow", allowed.join(", "));
    return res.status(405).end();
  }

  try {
    const target = new URL(`auth/google/${action}`, upstream);
    target.search = new URL(req.url ?? "/", "http://localhost").search;
    const headers = new Headers();
    for (const name of ["content-type", "origin", "cookie"]) {
      const value = req.headers[name];
      if (typeof value === "string") headers.set(name, value);
    }

    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
    const vercel = process.env.VERCEL === "1" || !loopback;
    const secret = process.env.GOOGLE_PROXY_SECRET;
    if (vercel || secret) {
      // Vercel supplies this header at ingress. Local servers use the socket address.
      const address = vercel ? req.headers["x-vercel-forwarded-for"] : req.socket.remoteAddress;
      if (!secret || !/^[a-f0-9]{64}$/i.test(secret) || typeof address !== "string" || !isIP(address) ||
          (vercel && target.protocol !== "https:")) {
        return res.status(503).json({ error: "Google sign-in is temporarily unavailable." });
      }
      headers.set("Authorization", `Bearer ${secret}`);
      headers.set("X-Im-Listening-Client-IP", address);
    }

    let body: Uint8Array<ArrayBuffer> | undefined;
    if (method === "POST") {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        size += chunk.length;
        if (size > 4096) {
          req.resume();
          return res.status(413).json({ error: "Invalid request body." });
        }
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }
    const reply = await fetch(target, {
      method, headers, body, redirect: "manual", signal: AbortSignal.timeout(25000),
    });
    const responseBody = Buffer.from(await reply.arrayBuffer());
    for (const name of ["content-type", "location", "ratelimit", "ratelimit-policy", "retry-after"]) {
      const value = reply.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    const cookies = reply.headers.getSetCookie();
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    res.status(reply.status).end(responseBody);
  } catch {
    res.status(503).json({ error: "Google sign-in is temporarily unavailable." });
  }
}
