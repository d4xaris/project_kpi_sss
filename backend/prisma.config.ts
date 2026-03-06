import { config } from "dotenv";
import path from "path";
import "dotenv/config";
import type { PrismaConfig } from "prisma";
import { env } from "prisma/config";

// This manually forces the load from the backend folder
config({ path: path.resolve(process.cwd(), ".env") });

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
} satisfies PrismaConfig;