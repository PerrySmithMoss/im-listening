import express, { Request, Response, Application } from "express";
import { PrismaClient } from "@prisma/client";

const app: Application = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

const main = async () => {
  const app: Application = express();

  app.get("/", async (req: Request, res: Response) => {
    const allUsers = await prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
    res.send({ allUsers });
  });

  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
};

main()
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
