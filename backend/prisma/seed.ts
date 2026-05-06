import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as bcrypt from "bcrypt";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      login: "Alice",
      nickname: "Alice",
      password: hashedPassword,
      totalWins: 52,
      gamesPlayed: 67,
    },
    {
      login: "Bob",
      nickname: "Bob",
      password: hashedPassword,
      totalWins: 15,
      gamesPlayed: 42,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: {
        login: userData.login,
      },
      update: {},
      create: userData,
    });
    console.log(`Created user: ${user.login}`);
  }

  console.log("Congratulations, seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect;
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect;
    process.exit(1);
  });
