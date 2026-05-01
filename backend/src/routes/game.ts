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
  app.post(
    "/game/create",
    { schema: gameCreateSchema },
    async (request, reply) => {
      const user = request.user as {
        id: number;
        nickname: string;
      };

      const { sessionName, maxPlayers } = request.body as any;

      const game = await app.prisma.GameSession.create({
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
    },
  );

  // for seeing status of game
  app.get("/game/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };

    const game = await app.prisma.GameSession.findUniqueOrThrow({
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
  app.post("/game/:id/start", async (request, reply) => {
    const { id } = request.params as { id: string };
    const gameId = Number(id);

    const game = await app.prisma.GameSession.findUniqueOrThrow({
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

    await app.prisma.GameSession.update({
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
}
