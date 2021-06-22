import { PrismaClient, Prisma } from "@prisma/client";

export type PrismaContext = {
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
}