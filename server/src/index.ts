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

  console.log("REDIS_URL: ", process.env.REDIS_URL);
  console.log("REDIS_HOST: ", process.env.REDIS_HOST);
  console.log("REDIS_PORT: ", process.env.REDIS_PORT);
  console.log("REDIS_PASSWORD: ", process.env.REDIS_PASSWORD);
  // const redisClient = new Redis(process.env.REDIS_URL); // prod
  const redisClient = new Redis({
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as unknown as number,
    password: process.env.REDIS_PASSWORD as string,
  }); // prod
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
