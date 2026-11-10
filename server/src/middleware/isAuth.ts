import { GraphQLError } from "graphql";
import type { MiddlewareFn } from "type-graphql";
import type { PrismaContext } from "../types/PrismaContext";

export function authenticatedUserId({ req }: PrismaContext): number {
  const id = req.session.userId;
  if (!id) {
    throw new GraphQLError("Sign in to continue.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return id;
}

export const isAuth: MiddlewareFn<PrismaContext> = ({ context }, next) => {
  authenticatedUserId(context);
  return next();
};
