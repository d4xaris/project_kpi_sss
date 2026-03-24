import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client/extension";

export default fp(async (app) => {
  const prisma = new PrismaClient();

  await prisma.$connect();

  app.decorate("prisma", prisma).addHook("onClose", async (server) => {
    await server.prisma.$disconnect();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
