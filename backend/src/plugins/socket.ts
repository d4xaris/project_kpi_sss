import fp from "fastify-plugin";
import { Server } from "socket.io";
import type { ClientToServer, ServerToClient } from "./shared/socketTypes.js";

declare module "fastify" {
  interface FastifyInstance {
    io: Server<ClientToServer, ServerToClient>;
  }
}

export default fp(async (app) => {
  try {
    const io = new Server<ClientToServer, ServerToClient>(app.server, {
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

      socket.on("join_room", async (data) => {
        try {
          const { gameId, nickname } = data;

          const session = await app.prisma.gameSession.findUnique({
            where: { id: gameId },
          });

          if (!session) {
            return socket.emit("error_message", {
              code: "NOT_FOUND",
              message: "Game not found",
            });
          }

          const roomName = `${gameId}`;
          socket.join(roomName);
          socket.data.nickname = nickname;

          const currentSession = await app.prisma.gameSession.findUnique({
            where: { id: gameId },
            include: { players: true },
          });

          if (!currentSession) {
            return socket.emit("error_message", {
              code: "NOT_FOUND",
              message: "Game not found",
            });
          }

          socket.emit("current_players", currentSession.players);

          socket.to(roomName).emit("joined_player", {
            id: socket.id,
            nickname: nickname,
          });
        } catch (err) {
          app.log.error(err);
          socket.emit("error_message", {
            message: "An error has occured",
          });
        }
      });

      socket.on("disconnecting", () => {
        app.log.info(`Socket disconnecting: ${socket.id}`);

        for (const roomName of socket.rooms) {
          if (roomName !== socket.id) {
            socket.to(roomName).emit("player_left", {
              socketId: socket.id,
              nickname: socket.data.nickname,
            });
          }
        }
      });

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
