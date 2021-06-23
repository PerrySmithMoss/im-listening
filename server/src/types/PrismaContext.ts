import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";

export type PrismaContext = {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  req: Request & { session: any },
  res: Response
};
