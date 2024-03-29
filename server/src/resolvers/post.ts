import "reflect-metadata";
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Int,
  Mutation,
  UseMiddleware,
  ObjectType,
  Field,
} from "type-graphql";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { PrismaContext } from "../types/PrismaContext";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: Boolean;
}

@Resolver()
export class PostResolver {
  @Query(() => PaginatedPosts)
  async getPosts(
    @Ctx() ctx: PrismaContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null
  ) {
    const maxLimit = Math.min(6, limit);
    const maxLimitPlusOne = maxLimit + 1;

    if (cursor) {
      const posts = await ctx.prisma.post.findMany({
        where: {
          createdAt: {
            lt: cursor as Date,
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: maxLimitPlusOne,
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          songGenres: true,
        },
      });
      return {
        posts: posts.slice(0, maxLimit),
        hasMore: posts.length === maxLimitPlusOne,
      };
    } else {
      const posts = await ctx.prisma.post.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: maxLimitPlusOne,
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          songGenres: true,
        },
      });

      return {
        posts: posts.slice(0, maxLimit),
        hasMore: posts.length === maxLimitPlusOne,
      };
    }
  }

  @Query(() => PaginatedPosts)
  async getRecentPosts(
    @Ctx() ctx: PrismaContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null
  ) {
    const maxLimit = Math.min(6, limit);
    const maxLimitPlusOne = maxLimit + 1;

    if (cursor) {
      const posts = await ctx.prisma.post.findMany({
        where: {
          createdAt: {
            lt: cursor as Date,
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: maxLimitPlusOne,
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          songGenres: true,
        },
      });
      return {
        posts: posts.slice(0, maxLimit),
        hasMore: posts.length === maxLimitPlusOne,
      };
    } else {
      const posts = await ctx.prisma.post.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: maxLimitPlusOne,
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          songGenres: true,
        },
      });

      return {
        posts: posts.slice(0, maxLimit),
        hasMore: posts.length === maxLimitPlusOne,
      };
    }
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
        songGenres: true,
      },
    });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Ctx() ctx: PrismaContext,
    @Arg("albumName") albumName: string,
    @Arg("artistName") artistName: string,
    @Arg("rating") rating: number,
    @Arg("title") title: string,
    @Arg("genre") genre: string,
    @Arg("genres", () => [String]) genres: string[],
    @Arg("previewSongUrl", () => String || null, { nullable: true })
    previewSongUrl: string | null,
    @Arg("albumImage") albumImage: string
  ) {
    const post = await ctx.prisma.post.create({
      data: {
        albumName,
        artistName,
        rating,
        title,
        genre,
        previewSongUrl,
        albumImage: albumImage,
        authorId: ctx.req.session.userId,
      },
    });

    await ctx.prisma.$transaction(
      genres.map((genre: string) =>
        ctx.prisma.songGenre.create({
          data: {
            genre: genre,
            postId: post.id,
          },
        })
      )
    );

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
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
  @UseMiddleware(isAuth)
  async deletePost(
    @Ctx() ctx: PrismaContext,
    @Arg("id", () => Int) id: number
  ) {
    try {
      const post = await ctx.prisma.post.findUnique({ where: { id: id } });
      if (!post) {
        return false;
      }

      if (post.authorId !== ctx.req.session.userId) {
        throw new Error("You can only delete posts which belong to you.");
      }

      await ctx.prisma.post.delete({
        where: {
          id: id,
        },
      });
    } catch(err) {
      console.log(err)
      return false;
    }
    return true;
  }

  @Query(() => PaginatedPosts)
  async filterPosts(
    @Ctx() ctx: PrismaContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null,
    @Arg("genres", () => [String]) genres: string[]
  ) {
    const maxLimit = Math.min(6, limit);
    const maxLimitPlusOne = maxLimit + 1;

    if (cursor) {
      const posts = await ctx.prisma.post.findMany({
        where: {
          createdAt: {
            lt: cursor as Date,
          },
          // Find all posts which match the genres passed in as an argument
          OR: [
            {
              genre: {
                in: genres,
              },
            },
            {
              songGenres: {
                some: {
                  genre: {
                    in: genres,
                  },
                },
              },
            },
          ],
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: maxLimitPlusOne,
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          songGenres: true,
        },
      });
      return {
        posts: posts.slice(0, maxLimit),
        hasMore: posts.length === maxLimitPlusOne,
      };
    } else {
      const posts = await ctx.prisma.post.findMany({
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        where: {
          // Find all genres which match the genres passed in as an argument
          OR: [
            {
              genre: {
                in: genres,
              },
            },
            {
              songGenres: {
                some: {
                  genre: {
                    in: genres,
                  },
                },
              },
            },
          ],
        },
        take: maxLimitPlusOne,
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          songGenres: true,
        },
      });

      return {
        posts: posts.slice(0, maxLimit),
        hasMore: posts.length === maxLimitPlusOne,
      };
    }
  }
}
