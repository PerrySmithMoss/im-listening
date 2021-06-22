import express, { Request, Response, Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const main = async () => {
  const app: Application = express();
  app.use(express.static("public"));

  app.get("/", async (req: Request, res: Response) => {
    // await prisma.user.create({
    //   data: {
    //     firstName: 'Jasper',
    //     lastName: 'Cullen',
    //     username: 'JasperC',
    //     email: 'jasperc@gmail.com',
    //     posts: {
    //       create: { albumName: 'Debut', content: "Love this project.", title: "Timeless", artistName: "Bjork", rating: 5 },
    //     },
    //     profile: {
    //       create: { bio: "I'm all ears" },
    //     },
    //   },
    // })
    const recentPosts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    res.send({ recentPosts });
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
    }),
    context: () => ({ prisma: prisma }),
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
