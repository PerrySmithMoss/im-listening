import "reflect-metadata";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { PrismaContext } from "../types/PrismaContext";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  getPosts(@Ctx() ctx: PrismaContext) {
    return ctx.prisma.post.findMany({
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  @Query(() => Post, { nullable: true })
  getPost(@Arg("id", () => Int) id: number, @Ctx() ctx: PrismaContext) {
    return ctx.prisma.post.findUnique({
      where: {
        id: id,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  @Mutation(() => Post)
  async createPost(
    @Ctx() ctx: PrismaContext,
    @Arg("albumName") albumName: string,
    @Arg("artistName") artistName: string,
    @Arg("rating") rating: number,
    @Arg("title") title: string,
    @Arg("content") content: string
  ) {
    return ctx.prisma.post.create({
      data: {
        albumName,
        artistName,
        rating,
        title,
        content,
        authorId: 18,
      },
    });
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() ctx: PrismaContext,
    @Arg("id") id: number,
    @Arg("rating") rating: number
  ) {
    const post = await ctx.prisma.post.findUnique({ where: { id: id } });
    if (!post) {
      return null;
    } else {
      return ctx.prisma.post.update({
        where: { id: id },
        data: { rating: rating },
      });
    }
  }

  @Mutation(() => Boolean)
  async deletePost(@Ctx() ctx: PrismaContext, @Arg("id") id: number) {
    try {
      await ctx.prisma.post.delete({
        where: { id: id },
      });
    } catch {
      return false;
    }
    return true;
  }
}
