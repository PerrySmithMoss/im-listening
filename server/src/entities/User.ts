import 'reflect-metadata'
import { ObjectType, Field, ID, Int } from 'type-graphql'
import { Post } from './Post'
import { Profile } from './Profile'

@ObjectType()
export class User {
  @Field(() => ID)
  id: number
  
  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  email: string

  password: string

  @Field(() => String)
  firstName: string

  @Field(() => String)
  lastName: string

  @Field(() => String)
  username: string

  @Field(() => [Post])
  posts: Post[]

  @Field(() => Profile)
  profile: Profile
}