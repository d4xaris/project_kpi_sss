import Fastify from "fastify";
import 'dotenv/config';

import gameRoutes from "./routes/game.js";
import authRoutes from "./routes/auth.js";
import authPlugin from "./plugins/jwt.js";
const app = Fastify({ logger: true });

await app.register(authPlugin);

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
