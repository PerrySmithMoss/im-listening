import "reflect-metadata";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Field,
} from "type-graphql";
import { PrismaContext } from "../types/PrismaContext";
import argon2 from "argon2";
import { User } from "../entities/User";
import { validateEmail } from "../../utils/validateEmail";
import { sendEmail } from "../../utils/sendEmail";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../../constants";

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

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async registerUser(
    @Ctx() ctx: PrismaContext,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    if (validateEmail(email) === false) {
      return {
        errors: [
          {
            field: "email",
            message: "Email provided is not valid.",
          },
        ],
      };
    }

    if (password.length < 8) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be 8 characters or greater.",
          },
        ],
      };
    }

    const checkIfUserExists = await ctx.prisma.user.findUnique({
      where: { username: username },
    });
    if (checkIfUserExists) {
      return {
        errors: [
          {
            field: "email",
            message:
              "A user with this username already exists, please choose another one.",
          },
        ],
      };
    }

    let registeredUser;
    try {
      const hashedPassword = await argon2.hash(password);
      registeredUser = await ctx.prisma.user.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          password: hashedPassword,
          profile: {
            create: {},
          },
        },
      });
    } catch (err) {
      console.log(err);
    }

    ctx.req.session.userId = registeredUser?.id;
    return {
      user: registeredUser,
    };
  }

  @Mutation(() => UserResponse)
  async loginUser(
    @Ctx() ctx: PrismaContext,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const user = await ctx.prisma.user.findUnique({
      where: { email: email },
      include: { posts: true, profile: true },
    });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "Could not find a user with that email.",
          },
        ],
      };
    }

    const validUser = await argon2.verify(user.password, password);
    if (!validUser) {
      return {
        errors: [
          {
            field: "password",
            message: "The password is incorrect",
          },
        ],
      };
    }

    ctx.req.session.userId = user.id;

    return {
      user: user,
    };
  }

  @Query(() => User, { nullable: true })
  async getCurrentUser(@Ctx() ctx: PrismaContext) {
    // You're not logged in
    if (!ctx.req.session.userId) {
      return null;
    }

    return await ctx.prisma.user.findUnique({
      where: {
        id: ctx.req.session.userId,
      },
      include: {
        posts: {
          include: {
            songGenres: true,
          },
        },
        profile: true,
      },
    });
  }

  @Mutation(() => Boolean)
  logoutUser(@Ctx() ctx: PrismaContext) {
    return new Promise((resolve) =>
      ctx.req.session.destroy((err: any) => {
        ctx.res.clearCookie(process.env.COOKIE_NAME as string);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() ctx: PrismaContext) {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return false;
      }

      const token = v4();

      await ctx.redisClient.set(
        FORGET_PASSWORD_PREFIX + token,
        user.id,
        "ex",
        3600000
      ); // 1 hour

      await sendEmail(
        email,
        `<a href="${process.env.SERVER_URL}/change-password/${token}">Reset Password</a>`
      );

      return true;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("password") password: string,
    @Ctx() ctx: PrismaContext
  ) {
    if (password.length < 8) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be 8 characters or greater.",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await ctx.redisClient.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired.",
          },
        ],
      };
    }

    const loggedInUser = await ctx.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { posts: true, profile: true },
    });
    if (!loggedInUser) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists.",
          },
        ],
      };
    }

    const updatedUser = await ctx.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: await argon2.hash(password), updatedAt: new Date() },
      include: { posts: true, profile: true },
    });

    await ctx.redisClient.del(key);

    // login user after change password
    ctx.req.session.userId = updatedUser.id;

    return { user: updatedUser };
  }
}
