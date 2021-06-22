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
import e from "express";

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
            message: "Password must be greater than 8.",
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

    return {
      user: user,
    };
  }
}
