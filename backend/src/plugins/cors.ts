import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (app) => {
  app.register(cors, {
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
    methods: ["GET", "POST", "PATCH", "DELETE"], // will add new methods later
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
