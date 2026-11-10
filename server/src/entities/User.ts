import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";
import { Profile } from "./Profile";

@ObjectType()
export class PublicUser {
  @Field(() => ID)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  username: string;

  @Field(() => Profile, { nullable: true })
  profile: Profile | null;
}

@ObjectType()
export class User extends PublicUser {
  @Field()
  email: string;

  @Field(() => [Post])
  posts: Post[];
}
