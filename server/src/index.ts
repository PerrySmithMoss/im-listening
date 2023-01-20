import express, { Application } from "express";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import cookieParser from "cookie-parser";
import connectRedis from "connect-redis";
import { __prod__ } from "../constants";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const app: Application = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: process.env.CORS_ORIGIN as string,
  optionsSuccessStatus: 200,
  credentials: true,
};

const main = async () => {
  app.set("trust proxy", 1);
  app.use(cors(corsOptions));

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", process.env.SERVER_DOMAIN);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override, Set-Cookie, Cookie"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    next();
  });

  app.use(express.static("public"));
  app.use(cookieParser());

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
    csrfPrevention: true,
    introspection: !__prod__,
    cache: "bounded",
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: corsOptions });

  httpServer.listen(process.env.PORT, () =>
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
