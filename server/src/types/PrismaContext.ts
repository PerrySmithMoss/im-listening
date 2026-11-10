import type { Request, Response } from "express";
import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping } from "redis";
import type { PrismaClient } from "../generated/prisma/client";
import type { createMailer } from "../../utils/sendEmail";
import type { createAuthLimiter } from "../middleware/rateLimits";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    sessionVersion?: number;
  }
}

export type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>;

export type PrismaContext = {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  redis: RedisClient;
  authLimit: ReturnType<typeof createAuthLimiter>;
  sendResetEmail: ReturnType<typeof createMailer>;
  cookieName: string;
  cookie: { path: string; httpOnly: boolean; secure: boolean; sameSite: "lax" | "none" };
};
