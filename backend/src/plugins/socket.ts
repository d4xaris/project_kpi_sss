import fp from "fastify-plugin";
import { Server } from "socket.io";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

export default fp(async (app) => {
  try {
    const io = new Server(app.server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.FRONTEND_URL
            : true,
        methods: ["GET", "POST", "PATCH", "DELETE"], // will add new methods later
        credentials: true,
      },
    });

    if (!app.hasDecorator("io")) {
      app.decorate("io", io);
    }

    io.on("connection", (socket) => {
      socket.on("error", (error) => {
        app.log.error(`Socket error for ID ${socket.id}: ${error.message}`);
      });

      app.log.info(`Socket connected: ${socket.id}`);

      socket.on("disconnect", () => {
        app.log.info(`Socket disconnected: ${socket.id}`);
      });
    });

    app.addHook("onClose", (instance, done) => {
      if (instance.io) {
        instance.io.close();
      }
      done();
    });
  } catch (error) {
    app.log.error("Failed to initialize Socket.io:");
    app.log.error(error);
    throw error;
  }
});
