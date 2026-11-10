import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import {
  Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field, FieldResolver, Root,
} from "type-graphql";
import { destroySession, establishSession } from "../auth/session";
import { Prisma } from "../generated/prisma/client";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { validateEmail } from "../../utils/validateEmail";
import { postRelations } from "./post";
import type { PrismaContext } from "../types/PrismaContext";

const resetKey = (token: string) =>
  `im-listening:reset:${createHash("sha256").update(token).digest("hex")}`;

const fieldError = (field: string, message: string) => ({ errors: [{ field, message }] });
const invalidLogin = () => fieldError("password", "The email or password is incorrect.");
const invalidToken = () => fieldError("token", "This reset link has expired or has already been used.");
const validPassword = (value: string) => value.length >= 8 && value.length <= 128;
const passwordError = () => fieldError("password", "Use a password between 8 and 128 characters.");

const publicAccount = {
  id: true, createdAt: true, updatedAt: true, firstName: true, lastName: true,
  username: true, email: true, profile: true,
} satisfies Prisma.UserSelect;

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

// Compute one dummy hash at startup so a missing account follows the same
// password verification path as an account with an incorrect password.
const dummyPasswordHash = argon2.hash(randomBytes(32));

@Resolver(() => User)
export class UserResolver {
  @FieldResolver(() => [Post])
  posts(@Root() user: User, @Ctx() ctx: PrismaContext) {
    return ctx.prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { id: "desc" },
      take: 50,
      include: postRelations,
    });
  }

  @Mutation(() => UserResponse)
  async registerUser(
    @Ctx() ctx: PrismaContext,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
  ) {
    email = email.trim().toLowerCase();
    await ctx.authLimit("register", ctx.req.ip!, email);
    if (!validateEmail(email) || email.length > 190) return fieldError("email", "Enter a valid email address.");
    if (!validPassword(password)) return passwordError();
    firstName = firstName.trim();
    lastName = lastName.trim();
    username = username.trim();
    if (!firstName || firstName.length > 80) return fieldError("firstName", "Enter a first name of up to 80 characters.");
    if (!lastName || lastName.length > 80) return fieldError("lastName", "Enter a last name of up to 80 characters.");
    if (!username || username.length > 40 || /\s/u.test(username)) {
      return fieldError("username", "Enter a username of up to 40 characters without spaces.");
    }

    let user;
    try {
      user = await ctx.prisma.user.create({
        data: {
          firstName, lastName, username, email, password: await argon2.hash(password),
          profile: { create: { avatar: null } },
        },
        select: { ...publicAccount, sessionVersion: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const duplicateName = await ctx.prisma.user.findUnique({ where: { username }, select: { id: true } });
        return duplicateName
          ? fieldError("username", "This username is unavailable.")
          : fieldError("email", "Could not register with this email address.");
      }
      throw error;
    }
    await establishSession(ctx.req, user.id, user.sessionVersion);
    return { user };
  }

  @Mutation(() => UserResponse)
  async loginUser(@Ctx() ctx: PrismaContext, @Arg("email") email: string, @Arg("password") password: string) {
    email = email.trim().toLowerCase();
    await ctx.authLimit("login", ctx.req.ip!, email);
    if (!validateEmail(email) || !password || password.length > 128) return invalidLogin();
    const user = await ctx.prisma.user.findUnique({
      where: { email },
      select: { ...publicAccount, password: true, sessionVersion: true },
    });
    const valid = await argon2.verify(user?.password ?? await dummyPasswordHash, password);
    if (!user?.password || !valid) return invalidLogin();
    await establishSession(ctx.req, user.id, user.sessionVersion);
    return { user };
  }

  @Query(() => User, { nullable: true })
  getCurrentUser(@Ctx() ctx: PrismaContext) {
    const id = ctx.req.session.userId;
    return id ? ctx.prisma.user.findUnique({ where: { id }, select: publicAccount }) : null;
  }

  @Mutation(() => Boolean)
  async logoutUser(@Ctx() ctx: PrismaContext) {
    await destroySession(ctx.req);
    ctx.res.clearCookie(ctx.cookieName, ctx.cookie);
    return true;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() ctx: PrismaContext) {
    email = email.trim().toLowerCase();
    await ctx.authLimit("reset", ctx.req.ip!, email);
    if (!ctx.sendResetEmail || !validateEmail(email)) return true;
    const user = await ctx.prisma.user.findUnique({
      where: { email, password: { not: null } }, select: { id: true, sessionVersion: true },
    });
    if (!user) return true;
    const token = randomBytes(32).toString("base64url");
    const key = resetKey(token);
    await ctx.redis.set(key, `${user.id}:${user.sessionVersion}`, { expiration: { type: "EX", value: 3600 } });
    // Respond uniformly whether or not the account exists. SMTP runs separately
    // so its response time and delivery errors are not disclosed to the caller.
    void ctx.sendResetEmail(email, token).catch(async () => {
      console.error("Password reset email could not be sent");
      try {
        await ctx.redis.del(key);
      } catch {
        console.error("Undelivered password reset token could not be removed");
      }
    });
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(@Arg("token") token: string, @Arg("password") password: string, @Ctx() ctx: PrismaContext) {
    await ctx.authLimit("change", ctx.req.ip!, token);
    if (!validPassword(password)) return passwordError();
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return invalidToken();
    const ticket = await ctx.redis.getDel(resetKey(token));
    if (!ticket) return invalidToken();
    const [id, sessionVersion] = ticket.split(":").map(Number);
    const updated = await ctx.prisma.user.updateMany({
      where: { id, sessionVersion, password: { not: null } },
      data: { password: await argon2.hash(password), sessionVersion: { increment: 1 } },
    });
    if (!updated.count) return invalidToken();
    const user = await ctx.prisma.user.findUnique({ where: { id }, select: publicAccount });
    if (!user) return invalidToken();
    await establishSession(ctx.req, id, sessionVersion + 1);
    return { user };
  }
}
