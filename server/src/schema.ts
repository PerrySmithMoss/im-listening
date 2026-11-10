import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { HelloResolver } from "./resolvers/hello";

export const createSchema = () => buildSchema({
  resolvers: [HelloResolver, PostResolver, UserResolver],
  validate: false,
});
