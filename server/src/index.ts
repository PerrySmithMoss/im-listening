import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "../constants";
import cors from "cors";

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const main = async () => {
  const app: Application = express();
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN as string,
      credentials: true,
    })
  );
  app.use(express.static("public"));

  const RedisStore = connectRedis(session);
  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT as unknown as number,
  });

  redisClient.on("error", (err) => {
    console.log("Error " + err);
  });

  app.use(
    session({
      name: process.env.COOKIE_NAME as string,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
        // maxAge: 7000, // 1 day
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? "im-listening.com" : undefined
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET as string,
      resave: false,
    })
  );

  app.get("/", async (req, res) => {
    const recentPosts = await prisma.post.findMany({
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.send(recentPosts);
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
    }),
    context: ({ req, res }) => ({ prisma, req, res, redisClient }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () =>
    console.log(`🚀  Server running on http://localhost:${PORT}`)
  );
};

main()
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
