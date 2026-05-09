import type { FastifyInstance } from "fastify";
import { GameRoom } from "../game/GameRoom.js";
import { Session } from "node:inspector";

const gameCreateSchema = {
  body: {
    type: "object",
    required: ["sessionName", "maxPlayers"],
    properties: {
      sessionName: { type: "string", minLength: 3, maxLength: 18 },
      maxPlayers: { type: "integer", minimum: 2, maximum: 4 },
    },
  },
};

export default async function gameRoutes(app: FastifyInstance) {
  app.addHook("preValidation", (app as any).authenticate);

  // for creating the game
  app.post("/create", { schema: gameCreateSchema }, async (request, reply) => {
    const user = request.user as {
      id: number;
      nickname: string;
    };

    const { sessionName, maxPlayers } = request.body as any;

    const game = await app.prisma.gameSession.create({
      data: {
        sessionName: sessionName,
        maxPlayers: maxPlayers,
        hostId: user.id,
        players: {
          connect: { id: user.id },
        },
      },
    });

    const sessionId = String(game.id);

    // app.io.emit("room_created", {
    //   roomId: sessionId,
    //   roomName: game.sessionName,
    //   playerCount: 1,
    //   maxPlayers: maxPlayers,
    // });

    reply.status(201).send({
      success: true,
      message: "Game created",
      game: game,
    });
  });

  // for seeing status of game
  app.get("/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };

    const game = await app.prisma.gameSession.findUniqueOrThrow({
      where: { id: Number(id) },
      include: {
        players: true,
      },
    });

    return reply.send({
      success: true,
      game: game,
    });
  });

  // for start of the game
  app.post("/:id/start", async (request, reply) => {
    const { id } = request.params as { id: string };
    const gameId = Number(id);

    const game = await app.prisma.gameSession.findUniqueOrThrow({
      where: { id: gameId },
      include: {
        players: true,
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!game) {
      return reply.status(404).send({
        success: false,
        message: "Game not found",
      });
    }

    const user = request.user as { id: number };
    if (game.hostId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: "Forbidden",
        message: "Only the host can start the game",
      });
    }

    if (game._count.players < 2) {
      return reply.status(400).send({
        success: false,
        message: "Not enough players",
      });
    }

    const players = game.players.map((p) => p.id);

    await app.prisma.gameSession.update({
      where: { id: gameId },
      data: { status: "PLAYING" },
    });

    app.io.emit("lobby_room_removed", { id: id });

    return reply.send({
      success: true,
      messege: "Game started",
      players: players,
      gameId: gameId,
    });
  });

  app.get("/sessions", async (request, reply) => {
    const sessions = await app.prisma.gameSession.findMany({
      where: {
        status: "LOBBY",
      },
      include: {
        _count: {
          select: { players: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const rooms = sessions.map((session) => ({
      id: session.id,
      sessionName: session.sessionName,
      playerCount: session._count.players,
      maxPlayers: session.maxPlayers,
      hostId: session.hostId,
    }));

    return {
      success: true,
      rooms: rooms,
    };
  });

  app.post("/:id/join", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as {
      id: number;
      nickname: string;
    };
    const userId = String(user.id);

    const session = await app.prisma.gameSession.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!session) {
      return reply.status(404).send({
        success: false,
        message: "Didn't found session",
      });
    }

    if (session.status !== "LOBBY") {
      return reply.status(400).send({
        success: false,
        message: "Game already started or ended",
      });
    }

    if (session._count.players >= session.maxPlayers) {
      return reply.status(400).send({
        success: false,
        message: "Session is full",
      });
    }

    const sessionId = String(session.id);

    const activeSession = await app.prisma.gameSession.findFirst({
      where: {
        players: {
          some: { id: user.id },
        },
        status: {
          in: ["LOBBY", "PLAYING"],
        },
      },
    });

    if (activeSession) {
      return reply.status(400).send({
        success: false,
        message: "You are already in another session",
        activeSessionId: activeSession.id,
      });
    }

    await app.prisma.gameSession.update({
      where: { id: session.id },
      data: {
        players: {
          connect: { id: user.id },
        },
      },
    });

    return {
      success: true,
      message: "You successfully joined the room",
      sessionId: session.id,
    };
  });

  app.post("/:id/leave", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as {
      id: number;
      nickname: string;
    };
    const sessionId = parseInt(id);
    const userId = String(user.id);

    const session = await app.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!session) {
      return reply.status(404).send({
        success: false,
        message: "Didn't found session",
      });
    }

    if (session.hostId === user.id) {
      await app.prisma.gameSession.delete({
        where: { id: sessionId },
      });
      app.io.to(`${sessionId}`).emit("game_deleted");

      app.io.emit("lobby_room_removed", {
        id: id,
      });

      return {
        success: true,
        message: "Session is deleted",
      };
    } else {
      await app.prisma.gameSession.update({
        where: { id: sessionId },
        data: {
          players: {
            disconnect: { id: user.id },
          },
        },
      });

      return {
        success: true,
        message: "You successfully left session",
      };
    }
  });

  app.post("/:id/finish", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { winnerId } = request.body as { winnerId: number };
    const sessionId = parseInt(id);

    const session = await app.prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { players: true },
    });

    if (!session) {
      return reply.status(404).send({
        success: false,
        message: "Game not found",
      });
    }

    if (session.status !== "PLAYING") {
      return reply.status(400).send({
        success: false,
        message: "Game not finnished",
      });
    }

    const playersIds = session.players.map((p) => p.id);

    await app.prisma.$transaction([
      app.prisma.user.updateMany({
        where: {
          id: {
            in: playersIds,
          },
        },
        data: {
          gamesPlayed: {
            increment: 1,
          },
        },
      }),

      app.prisma.user.update({
        where: {
          id: winnerId,
        },
        data: {
          totalWins: {
            increment: 1,
          },
        },
      }),

      app.prisma.gameSession.update({
        where: {
          id: sessionId,
        },
        data: {
          status: "ENDED",
        },
      }),
    ]);

    app.io.to(`${sessionId}`).emit("game_finished", {
      winnerId: winnerId,
    });

    return {
      success: true,
      message: "Game finished, everything updated",
    };
  });
}
