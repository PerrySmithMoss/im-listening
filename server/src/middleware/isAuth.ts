import { MiddlewareFn } from "type-graphql";
import { PrismaContext } from "../types/PrismaContext";

export const isAuth: MiddlewareFn<PrismaContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated");
  }

  return next();
};
