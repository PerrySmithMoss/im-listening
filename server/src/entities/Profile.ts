import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'
import { User } from './User'

@ObjectType()
export class Profile {
  @Field(() => ID)
  id: number
  
  @Field(() => String || null, {nullable: true})
  bio?: string | null

  @Field(() => String || null, {nullable: true})
  avatar?: string | null

  @Field(() => User)
  user: User
}