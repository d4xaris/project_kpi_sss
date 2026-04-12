import type { FastifyInstance } from "fastify";
import { request } from "node:http"; // idk what is this line, it just appered after I used request in app.post

export default async function gameRoutes(app: FastifyInstance) {
  app.post("/game/create", async (request, reply) => {
    const { sessionName, maxPlayers, isPrivate, password } = request.body as {
      sessionName: string;
      maxPlayers: number;
      isPrivate: boolean; // will think later about it
      password?: number;
    };

    const game = await app.prisma.GameSession.create({
      data: {
        sessionName: sessionName,
        maxPlayers: maxPlayers,
        isPrivate: isPrivate,
        password: password ?? null,
        hostId: 1, // right now doesnt work, will work on it later
      },
    });

    // probably need to add smth that will make error if isPrivate: true, but password: null
    // rn idk how or what to do with this, will think about it later

    reply.status(201).send(game);
  }); // this thing will be connected to front but rn idk how, just mark for future
}
