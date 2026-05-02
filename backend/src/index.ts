import Fastify from "fastify";
import "dotenv/config";

import gameRoutes from "./routes/game.js";
import authRoutes from "./routes/auth.js";

const app = Fastify({ logger: true });

await app.register(import("./plugins/prisma.js"));
await app.register(import("./plugins/jwt.js"));
app.register(import("./plugins/cors.js"));
await app.register(import("./plugins/errorHandler.js"));

app.register(gameRoutes, { prefix: "/game" });
app.register(authRoutes, { prefix: "/auth" });

// routes
// socket

app.get("/", async () => {
  return { message: "Hello World!" };
});

try {
  await app.listen({ port: 3000, host: "0.0.0.0" });
  console.log("Server running on http://localhost:3000");
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
