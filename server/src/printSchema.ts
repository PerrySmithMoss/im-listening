import { lexicographicSortSchema, printSchema } from "graphql";
import { createSchema } from "./schema";

void createSchema().then((schema) => {
  process.stdout.write(printSchema(lexicographicSortSchema(schema)) + "\n");
});
