import type { FastifyInstance } from "fastify";
import { request } from "node:http"; // idk what is this line, it just appered after I used request in app.post

export default async function gameRoutes(app: FastifyInstance) {
  app.post("/game/create", async (request, reply) => {
    const { sessionName, maxPlayers } = request.body as {
      sessionName: string;
      maxPlayers: number;
    };

    const game = await app.prisma.GameSession.create({
      data: {
        sessionName: sessionName,
        maxPlayers: maxPlayers,
        hostId: 1, // right now doesnt work, will work on it later
      },
    });

    reply.status(201).send(game);
  }); // this thing will be connected to front but rn idk how, just mark for future

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
      // I a bit not understand how this send({error}) works but let it be here
    }
  });
}
