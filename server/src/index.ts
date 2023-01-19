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
const corsOptions = {
  origin: process.env.CORS_ORIGIN as string,
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const main = async () => {
  app.use(cors(corsOptions));
  app.use(express.static("public"));

  // const redisClient = new Redis(process.env.REDIS_URL); // prod
  const redisClient = new Redis(process.env.REDIS_URL as string); // prod
  // const redisClient = new Redis({
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT as unknown as number
  // });

  console.log("Server Domain: ", process.env.SERVER_DOMAIN);
  console.log("Prod: ", __prod__);
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
        domain: process.env.SERVER_DOMAIN,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET as string,
      resave: false,
    })
  );

  app.get("/", async (_, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      response_time: process.hrtime(),
      message: "OK",
      timestamp: Date.now(),
    };
    try {
      res.send(healthcheck);
    } catch (error: any) {
      healthcheck.message = error;
      res.status(503).send(healthcheck);
    }
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
    }),
    context: ({ req, res }) => ({ prisma, req, res, redisClient }),
    playground: !__prod__ ? false : true,
    introspection: !__prod__ ? false : true,
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
