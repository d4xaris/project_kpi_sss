import type { FastifyInstance } from "fastify";

export default async function gameRoutes(app: FastifyInstance) {
  app.addHook("preValidation", (app as any).authenticate);

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
