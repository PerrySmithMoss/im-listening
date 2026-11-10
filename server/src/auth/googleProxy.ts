import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { Request, RequestHandler } from "express";

declare module "express-serve-static-core" {
  interface Request {
    googleClientIp?: string;
  }
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export function authenticateGoogleProxy(secret?: string): RequestHandler {
  const expected = secret && digest(`Bearer ${secret}`);
  return (req, res, next) => {
    if (expected) {
      const address = req.get("X-Im-Listening-Client-IP");
      const authorization = req.get("Authorization");
      if (!address || !isIP(address) || !authorization || !timingSafeEqual(digest(authorization), expected)) {
        res.status(403).json({ error: "Google sign-in must use the frontend proxy." });
        return;
      }
      req.googleClientIp = address;
    }
    next();
  };
}

export const googleClientIp = (req: Request) => req.googleClientIp ?? req.ip!;
