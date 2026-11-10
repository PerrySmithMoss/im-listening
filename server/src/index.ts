import { createServer } from "node:http";
import { resolve } from "node:path";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import { depthLimit } from "@graphile/depth-limit";
import { PrismaPg } from "@prisma/adapter-pg";
import { RedisStore } from "connect-redis";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import helmet from "helmet";
import { createClient, type RedisModules, type RedisFunctions, type RedisScripts, type RespVersions, type TypeMapping } from "redis";
import { ConfigError, loadConfig } from "./config";
import { PrismaClient } from "./generated/prisma/client";
import { createAuthLimiter, limitRequests } from "./middleware/rateLimits";
import { createSchema } from "./schema";
import { spotifyRouter } from "./spotify";
import type { PrismaContext } from "./types/PrismaContext";
import { createMailer } from "../utils/sendEmail";

async function main() {
  const config = loadConfig();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl.href }) });
  const redis = createClient<RedisModules, RedisFunctions, RedisScripts, RespVersions, TypeMapping>({
    url: config.redisUrl,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => retries < 5 ? Math.min(100 * 2 ** retries, 2000) : false,
    },
  });
  redis.on("error", () => console.error("Redis connection error"));

  try {
    await Promise.all([redis.connect(), prisma.$connect()]);
    const app = express();
    const httpServer = createServer(app);
    const authLimit = createAuthLimiter(redis);
    const sendResetEmail = createMailer(config);

    app.disable("x-powered-by");
    if (config.trustProxyHops) app.set("trust proxy", config.trustProxyHops);
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      strictTransportSecurity: config.production,
    }));
    app.get(["/", "/healthz"], (_req, res) => res.json({ status: "ok" }));
    app.use("/images", express.static(resolve(__dirname, "../../public/images"), { index: false }));

    app.use(["/graphql", "/spotify"], cors({ origin: config.clientOrigin, credentials: true }));
    app.use(["/graphql", "/spotify"], (req, res, next) => {
      res.set("Cache-Control", "no-store");
      const origin = req.get("origin");
      if (origin && origin !== config.clientOrigin) {
        res.status(403).json({ error: "Origin is not allowed." });
        return;
      }
      next();
    });
    app.use("/graphql", limitRequests(redis, "graphql", 120));
    app.use(["/graphql", "/spotify"], session({
      name: config.cookieName,
      store: new RedisStore({ client: redis, prefix: "im-listening:sess:", disableTouch: true }),
      cookie: { ...config.cookie, maxAge: 7 * 24 * 60 * 60 * 1000 },
      saveUninitialized: false,
      secret: config.secret,
      resave: false,
    }));
    app.use(["/graphql", "/spotify"], async (req, res, next) => {
      if (req.session.userId) {
        const user = await prisma.user.findUnique({
          where: { id: req.session.userId },
          select: { sessionVersion: true },
        });
        if (!user || user.sessionVersion !== req.session.sessionVersion) {
          await new Promise<void>((resolve, reject) =>
            req.session.regenerate((err) => err ? reject(err) : resolve()),
          );
          res.clearCookie(config.cookieName, config.cookie);
        }
      }
      next();
    });
    app.use("/spotify", spotifyRouter(config, redis));

    const apollo = new ApolloServer<PrismaContext>({
      schema: await createSchema(),
      csrfPrevention: true,
      introspection: !config.production,
      includeStacktraceInErrorResponses: false,
      hideSchemaDetailsFromClientErrors: config.production,
      validationRules: [depthLimit({ maxDepth: 8, maxListDepth: 3, maxSelfReferentialDepth: 2 })],
      maxRecursiveSelections: 300,
      parseOptions: { maxTokens: 1000 },
      stopOnTerminationSignals: false,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      formatError: (error) => {
        if (error.extensions?.code !== "INTERNAL_SERVER_ERROR") return error;
        console.error("GraphQL operation failed");
        return { message: "Something went wrong.", extensions: { code: "INTERNAL_SERVER_ERROR" } };
      },
    });
    await apollo.start();
    app.post("/graphql", express.json({ limit: "32kb" }), expressMiddleware(apollo, {
      context: async ({ req, res }) => ({
        req, res, prisma, redis, authLimit, sendResetEmail,
        cookieName: config.cookieName, cookie: config.cookie,
      }),
    }));

    const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
      if (res.headersSent) return next(error);
      if (error.status === 400 || error.status === 413) {
        res.status(error.status).json({ error: "Invalid request body." });
        return;
      }
      console.error("HTTP request failed");
      res.status(500).json({ error: "Something went wrong." });
    };
    app.use(errorHandler);

    await new Promise<void>((resolve, reject) => {
      httpServer.once("error", reject);
      httpServer.listen(config.port, config.host, resolve);
    });
    console.log(`API listening on ${config.host}:${config.port}`);
    const shutdown = async () => {
      try {
        await apollo.stop();
      } finally {
        await Promise.allSettled([redis.close(), prisma.$disconnect()]);
      }
    };
    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      process.once(signal, () => { void shutdown().catch(() => { process.exitCode = 1; }); });
    }
  } catch (error) {
    if (redis.isOpen) redis.destroy();
    await prisma.$disconnect();
    throw error;
  }
}

void main().catch((error: unknown) => {
  // Connection and transport errors can contain credentials or URLs.
  console.error(error instanceof ConfigError
    ? error.message
    : "API startup failed. Check the database and Redis connectivity.");
  process.exitCode = 1;
});
