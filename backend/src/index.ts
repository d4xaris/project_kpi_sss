import Fastify from "fastify";
import "dotenv/config";

const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing environmentvariable ${key}`);
    process.exit(1);
  }
}

import gameRoutes from "./routes/game.js";
import authRoutes from "./routes/auth.js";

const app = Fastify({
  logger:
    process.env.NODE_ENV === "production"
      ? true
      : {
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          },
        },
});

await app.register(import("./plugins/prisma.js"));
await app.register(import("./plugins/jwt.js"));
await app.register(import("./plugins/cors.js"));
await app.register(import("./plugins/socket.js"));
await app.register(import("./plugins/errorHandler.js"));
await app.register(import("@fastify/rate-limit"));

app.register(gameRoutes, {
  prefix: "/game",
  config: {
    rateLimit: {
      max: 100,
      timeWindow: "1 minute",
    },
  },
});
app.register(authRoutes, {
  prefix: "/auth",
  config: {
    rateLimit: {
      max: 10,
      timeWindow: "1 minute",
    },
  },
});

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
