import type { Request, Response } from "express";
import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping } from "redis";
import type { PrismaClient } from "../generated/prisma/client";
import type { createMailer } from "../../utils/sendEmail";
import type { createAuthLimiter } from "../middleware/rateLimits";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    sessionVersion?: number;
    authenticatedAt?: number;
    googleStarted?: boolean;
    googlePending?: import("../auth/googleRoutes").GooglePending;
  }
}

export type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>;

export type PrismaContext = {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  redis: RedisClient;
  authLimit: ReturnType<typeof createAuthLimiter>;
  sendResetEmail: NonNullable<ReturnType<typeof createMailer>>["sendReset"] | undefined;
  cookieName: string;
  cookie: { path: string; httpOnly: boolean; secure: boolean; sameSite: "lax" };
};
