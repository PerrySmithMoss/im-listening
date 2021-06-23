import express, { Request, Response, Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "../constants";
import { PrismaContext } from "./types/PrismaContext";

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const main = async () => {
  const app: Application = express();
  app.use(express.static("public"));

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT as unknown as number,
  });

  redisClient.on("error", (err) => {
    console.log("Error " + err);
  });

  app.use(
    session({
      name: "sid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
        // maxAge: 7000, // 1 day
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET as string,
      resave: false,
    })
  );

  app.get('/', async (req, res) => {
    const recentPosts = await prisma.post.findMany({
      include: {
        author: {
          include: {
            profile: true
          }
        }
      },
    })
    res.send(recentPosts)
  })

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
    }),
    context: ({ req, res }): PrismaContext => ({ prisma: prisma, req, res }),
    // subscriptions: {
    //   path: "/subscriptions",
    //   onConnect: () => console.log("✅  Client connected for subscriptions"),
    //   onDisconnect: () => console.log("❌  Client disconnected from subscriptions")
    // },
    // uploads: false,
  });

  apolloServer.applyMiddleware({ app });

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
