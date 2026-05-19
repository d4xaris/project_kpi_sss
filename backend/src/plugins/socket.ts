import fp from "fastify-plugin";
import { Server } from "socket.io";
import type {
  ClientToServer,
  ServerToClient,
  SocketData,
} from "./sockets/socketTypes.js";
import { registerSocketHandlers } from "./sockets/handler.js";
import { GameController } from "./sockets/controllers.js";

declare module "fastify" {
  interface FastifyInstance {
    io: Server<ClientToServer, ServerToClient, SocketData>;
  }
}

export default fp(async (app) => {
  try {
    const io = new Server<ClientToServer, ServerToClient, SocketData>(
      app.server,
      {
        cors: {
          origin:
            process.env.NODE_ENV === "production"
              ? process.env.FRONTEND_URL
              : true,
          methods: ["GET", "POST", "PATCH", "DELETE"], // will add new methods later
          credentials: true,
        },
      },
    );

    if (!app.hasDecorator("io")) {
      app.decorate("io", io);
    }

    const gameController = new GameController();

    io.on("connection", (socket) => {
      app.log.info(`Socket connected: ${socket.id}`);

      registerSocketHandlers(socket, app, [gameController]);

      socket.on("error", (error) => {
        app.log.error(`Socket error for ID ${socket.id}: ${error.message}`);
      });

      socket.on("disconnecting", async () => {
        app.log.info(`Socket disconnecting: ${socket.id}`);

        const { gameId, nickname, userId } = socket.data;

        if (!gameId || !userId) return;

        try {
          await app.prisma.gameSession.update({
            where: { id: Number(gameId) },
            data: {
              players: {
                disconnect: {
                  id: Number(userId),
                },
              },
            },
          });

          socket.to(`${gameId}`).emit("player_left", {
            socketId: String(userId),
            nickname: nickname,
          });

          const session = await app.prisma.gameSession.findUnique({
            where: { id: Number(gameId) },
            include: {
              _count: {
                select: {
                  players: true,
                },
              },
            },
          });

          if (!session) {
            return socket.emit("error_message", {
              code: "NOT_FOUND",
              message: "Game not found",
            });
          }

          const remaining = session._count.players;

          if (remaining === 0) {
            await app.prisma.gameSession.update({
              where: { id: Number(gameId) },
              data: { status: "ENDED" },
            });
            app.io.emit("lobby_room_removed", { id: String(gameId) });
          } else {
            app.io.emit("lobby_room_updated", {
              id: String(gameId),
              playerCount: remaining,
            });
          }

          app.log.info(
            `User ${nickname} (ID: ${userId}) automatically removed from room ${gameId}`,
          );

          socket.leave(`user_${userId}`);

          const logger = gameController.getLogger(gameId);
          logger?.log(
            userId,
            "PLAYER_LEFT",
            `Player ${nickname} disconnected from game ${gameId}.`,
          );
        } catch (err) {
          app.log.error(
            `Failed to handle disconnect for user ${userId}: ${err}`,
          );
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
