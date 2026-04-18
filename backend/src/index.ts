import Fastify from "fastify";

import gameRoutes from "./routes/game.js";

const app = Fastify({ logger: true });

app.register(gameRoutes, { prefix: "/game" });

// plugins
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
