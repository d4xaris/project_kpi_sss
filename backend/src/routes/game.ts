import type { FastifyInstance } from "fastify";
import { GameRoom } from "../game/GameRoom.js";

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
      include: { players: true },
    });

    const user = request.user as { id: number };
    if (game.hostId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: "Forbidden",
        message: "Only the host can start the game",
      });
    }

    const players = game.players.map((p: any) => p.id);

    const room = new GameRoom(players);
    // next line is the function of game settings which will be used in game(can't do it right now)
    // const gameSettings = room.function_of_settings_calculation()

    await app.prisma.gameSession.update({
      where: { id: gameId },
      data: { status: "PLAYING" },
    });

    return reply.send({
      success: true,
      messege: "Game started",
      players: players,
      //gameSettings: gameSettings
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
    const user = request.user as { id: number };
    const userId = user.id;

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

    await app.prisma.gameSession.update({
      where: { id: session.id },
      data: {
        players: {
          connect: { id: userId },
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
    const user = request.user as { id: number };
    const sessionId = parseInt(id);

    const session = await app.prisma.gameSession.findUnique({
      where: { id: sessionId },
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
}
