import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class SongGenre {
  @Field(() => ID)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field()
  genre: string;
}
