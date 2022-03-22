import "reflect-metadata";
import { ObjectType, Field, ID, Int } from "type-graphql";
import { Post } from "./Post";
import { Profile } from "./Profile";

@ObjectType()
export class SongGenre {
  @Field(() => ID)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  genre: string;

  @Field(() => Post)
  post: Post;
}
