import { PrismaClient, Prisma } from "@prisma/client";
import { Redis } from "ioredis"
import { Request, Response } from "express";

export type PrismaContext = {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: Request & { session: any },
  res: Response,
  redisClient: Redis
};
