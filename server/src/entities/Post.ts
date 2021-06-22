import 'reflect-metadata'
import { ObjectType, Field, ID, Int } from 'type-graphql'
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

  @Field(() => String)
  content: string

  @Field(() => String)
  artistName: string

  @Field(() => String)
  albumName: string

  @Field(() => Boolean, { nullable: true })
  published?: boolean | null

  @Field(() => Int)
  rating: number

  @Field(() => User)
  author?: User
}