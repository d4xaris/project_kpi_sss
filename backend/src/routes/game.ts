import type { FastifyInstance } from "fastify";
import { GameRoom } from "../game/GameRoom.js";

export default async function gameRoutes(app: FastifyInstance) {
  app.addHook("preValidation", (app as any).authenticate);

  // for creating the game
  app.post("/game/create", async (request, reply) => {
    const user = request.user as {
      id: number;
      nickname: string;
    };

    const { sessionName, maxPlayers } = request.body as {
      sessionName: string;
      maxPlayers: number;
    };

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

    reply.status(201).send(game);
  });

  // for seeing status of game
  app.get("/game/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };

    const game = await app.prisma.GameSession.findUnique({
      where: { id: Number(id) },
      include: {
        players: true,
      },
    });

    if (!game) {
      return reply.status(404).send({ error: "Game not found" });
    }
  });

  // for start of the game
  app.post("/game/:id/start", async (request, reply) => {
    const { id } = request.params as { id: string };
    const gameId = Number(id);

    const game = await app.prisma.GameSession.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return reply.status(404).send({ error: "Game not found" });
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
      messege: "Game started",
      players: players,
      //gameSettings: gameSettings
    });
  });
}
