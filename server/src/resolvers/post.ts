import { GraphQLError } from "graphql";
import {
  Resolver, Query, Ctx, Arg, Int, Mutation, UseMiddleware, ObjectType, Field,
} from "type-graphql";
import { Post } from "../entities/Post";
import type { Prisma } from "../generated/prisma/client";
import { authenticatedUserId, isAuth } from "../middleware/isAuth";
import type { PrismaContext } from "../types/PrismaContext";

export const postRelations = {
  author: {
    select: {
      id: true, firstName: true, lastName: true, username: true,
      createdAt: true, updatedAt: true, profile: true,
    },
  },
  songGenres: true,
} satisfies Prisma.PostInclude;

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

function checkRating(rating: number) {
  if (rating < 0.5 || rating > 5 || !Number.isInteger(rating * 2)) {
    badInput("Rating must be between 0.5 and 5 in half-star steps.");
  }
}

function checkGenres(genres: string[]) {
  if (genres.length > 20 || genres.some((genre) => genre.length < 1 || genre.length > 100)) {
    badInput("Supply up to 20 genres of 1 to 100 characters each.");
  }
}

function checkMediaUrl(value: string, optional: boolean) {
  if (optional && !value) return;
  try {
    const url = new URL(value);
    if (value.length <= 255 && url.protocol === "https:" && !url.username && !url.password) return;
  } catch {
    // Invalid URL.
  }
  badInput("Media URLs must use HTTPS.");
}

async function pagePosts(ctx: PrismaContext, limit: number, cursor: Date | null, cursorId: number | null, genres: string[] = []) {
  if (limit < 1) badInput("Limit must be positive.");
  checkGenres(genres);
  const take = Math.min(6, limit);
  const posts = await ctx.prisma.post.findMany({
    where: {
      ...(cursor && {
        AND: [{
          OR: [
            { createdAt: { lt: cursor } },
            ...(cursorId ? [{ createdAt: cursor, id: { lt: cursorId } }] : []),
          ],
        }],
      }),
      ...(genres.length && {
        OR: [
          { genre: { in: genres } },
          { songGenres: { some: { genre: { in: genres } } } },
        ],
      }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    include: postRelations,
  });
  return { posts: posts.slice(0, take), hasMore: posts.length > take };
}

@Resolver()
export class PostResolver {
  @Query(() => PaginatedPosts)
  getPosts(
    @Ctx() ctx: PrismaContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null,
    @Arg("cursorId", () => Int, { nullable: true }) cursorId: number | null,
  ) {
    return pagePosts(ctx, limit, cursor, cursorId);
  }

  @Query(() => PaginatedPosts)
  getRecentPosts(
    @Ctx() ctx: PrismaContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null,
    @Arg("cursorId", () => Int, { nullable: true }) cursorId: number | null,
  ) {
    return pagePosts(ctx, limit, cursor, cursorId);
  }

  @Query(() => PaginatedPosts)
  filterPosts(
    @Ctx() ctx: PrismaContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null,
    @Arg("cursorId", () => Int, { nullable: true }) cursorId: number | null,
    @Arg("genres", () => [String]) genres: string[],
  ) {
    return pagePosts(ctx, limit, cursor, cursorId, genres);
  }

  @Query(() => Post, { nullable: true })
  getPost(@Arg("id", () => Int) id: number, @Ctx() ctx: PrismaContext) {
    return ctx.prisma.post.findUnique({ where: { id }, include: postRelations });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  createPost(
    @Ctx() ctx: PrismaContext,
    @Arg("albumName") albumName: string,
    @Arg("artistName") artistName: string,
    @Arg("rating") rating: number,
    @Arg("title") title: string,
    @Arg("genre") genre: string,
    @Arg("genres", () => [String]) genres: string[],
    @Arg("previewSongUrl", () => String, { nullable: true }) previewSongUrl: string | null,
    @Arg("albumImage") albumImage: string,
  ) {
    checkRating(rating);
    checkGenres(genres);
    checkMediaUrl(albumImage, true);
    if (previewSongUrl !== null && previewSongUrl !== undefined) checkMediaUrl(previewSongUrl, false);
    for (const text of [albumName, artistName, title, genre]) {
      if (!text.trim() || text.length > 190) badInput("Post text must be 1 to 190 characters.");
    }
    return ctx.prisma.post.create({
      data: {
        albumName, artistName, rating, title: title.trim(), genre, previewSongUrl, albumImage,
        authorId: authenticatedUserId(ctx),
        songGenres: { create: [...new Set(genres)].map((genre) => ({ genre })) },
      },
      include: postRelations,
    });
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(@Ctx() ctx: PrismaContext, @Arg("id", () => Int) id: number, @Arg("rating") rating: number) {
    checkRating(rating);
    const where = { id, authorId: authenticatedUserId(ctx) };
    const result = await ctx.prisma.post.updateMany({ where, data: { rating } });
    return result.count ? ctx.prisma.post.findFirst({ where, include: postRelations }) : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Ctx() ctx: PrismaContext, @Arg("id", () => Int) id: number) {
    const result = await ctx.prisma.post.deleteMany({ where: { id, authorId: authenticatedUserId(ctx) } });
    return result.count === 1;
  }
}
