import "reflect-metadata";
import { Resolver, Query, Ctx } from "type-graphql";
import { Post } from "../entities/Post";
import { PrismaContext } from "../types/PrismaContext";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  recentPosts(@Ctx() ctx: PrismaContext) {
    return ctx.prisma.post.findMany({
      include: {
        author: {
            include: {
                profile: true
            }
        }
      },
    });
  }
}
