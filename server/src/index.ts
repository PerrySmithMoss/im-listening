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
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const app: Application = express();

const main = async () => {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN as string,
      credentials: true,
    })
  );
  app.use(express.static("public"));

  // const redisClient = new Redis(process.env.REDIS_URL); // prod
  const redisClient = new Redis(process.env.REDIS_URL as string); // prod
  // const redisClient = new Redis({
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT as unknown as number
  // });

  redisClient.connect(() => {
    console.log("Connected to Redis cloud");
  });

  redisClient.on("error", (err) => {
    console.log("Error " + err);
  });

  const RedisStore = connectRedis(session);

  app.use(
    session({
      name: process.env.COOKIE_NAME as string,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 6.048e8, // 7 days
        httpOnly: true,
        path: "/",
        sameSite: __prod__ ? "none" : "lax",
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? process.env.SERVER_DOMAIN : undefined,
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
    introspection: true
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () =>
    console.log(`🚀  Server running on ${process.env.SERVER_URL}`)
  );
};

main()
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
