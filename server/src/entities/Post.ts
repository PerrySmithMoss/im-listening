import 'reflect-metadata'
import { ObjectType, Field, ID, Int, Float } from 'type-graphql'
import { User } from './User'

@ObjectType()
export class Post {
  @Field(() => ID)
  id: number

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  title: string

  @Field(() => String, { nullable: true })
  previewSongUrl: string | null

  @Field(() => String)
  artistName: string

  @Field(() => String)
  albumName: string

  @Field(() => String)
  albumImage: string

  @Field(() => Boolean, { nullable: true })
  published?: boolean | null

  @Field(() => Float)
  rating: number

  @Field(() => User)
  author?: User
}