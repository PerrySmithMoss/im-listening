import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Profile {
  @Field(() => ID)
  id: number;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;
}
