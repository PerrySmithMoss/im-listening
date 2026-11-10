import "dotenv/config";
import { defineConfig } from "prisma/config";

let url = process.env.DATABASE_URL;
if (url && process.env.DATABASE_CA_FILE) {
  const securedUrl = new URL(url);
  securedUrl.searchParams.set("sslmode", "require");
  securedUrl.searchParams.set("sslcert", process.env.DATABASE_CA_FILE);
  securedUrl.searchParams.set("sslaccept", "strict");
  url = securedUrl.href;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url },
});
