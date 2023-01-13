"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const client_1 = require("@prisma/client");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("../constants");
const cors_1 = __importDefault(require("cors"));
const PORT = process.env.PORT || 5000;
const prisma = new client_1.PrismaClient();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = express_1.default();
    app.use(cors_1.default({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(express_1.default.static("public"));
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redisClient = new ioredis_1.default({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    });
    redisClient.on("error", (err) => {
        console.log("Error " + err);
    });
    app.use(express_session_1.default({
        name: process.env.COOKIE_NAME,
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 1,
            // maxAge: 7000, // 1 day
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.__prod__,
            domain: constants_1.__prod__ ? "im-listening.com" : undefined
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }));
    app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const recentPosts = yield prisma.post.findMany({
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        res.send(recentPosts);
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
        }),
        context: ({ req, res }) => ({ prisma, req, res, redisClient }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
});
main()
    .catch((err) => {
    console.log(err);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
//# sourceMappingURL=index.js.map