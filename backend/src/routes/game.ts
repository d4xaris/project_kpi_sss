import type { FastifyInstance } from "fastify";
import { GameService } from "../services/GameService.js";

// Validation schemas

const gameCreateSchema = {
  body: {
    type: "object",
    required: ["sessionName", "maxPlayers"],
    properties: {
      sessionName: { type: "string", minLength: 3, maxLength: 18 },
      maxPlayers:  { type: "integer", minimum: 2, maximum: 4 },
    },
  },
};

// Routes

export default async function gameRoutes(app: FastifyInstance) {
  const gameService = new GameService(app.prisma);

  // All /game routes require authentication
  app.addHook("preValidation", (app as any).authenticate);

  // POST /game/create
  app.post("/create", { schema: gameCreateSchema }, async (request, reply) => {
    const user = request.user as { id: number; nickname: string };
    const { sessionName, maxPlayers } = request.body as any;

    const activeSession = await gameService.findActiveSession(user.id);
    if (activeSession) {
      if (activeSession.status === "PLAYING") {
        // Stale session from a crash or server restart — clean it up so the user can continue
        await gameService.endSession(activeSession.id);
      } else {
        return reply.status(400).send({
          success: false,
          message: "You are already in another session",
          activeSessionId: activeSession.id,
        });
      }
    }

    const game = await gameService.createSession(sessionName, maxPlayers, user.id);

    return reply.status(201).send({
      success: true,
      message: "Game created",
      game,
    });
  });

  // GET /game/sessions
  app.get("/sessions", async (_request, reply) => {
    const rooms = await gameService.getLobbySessions();
    return reply.send({ success: true, rooms });
  });

  // GET /game/:id/status
  app.get("/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };

    const game = await gameService.getSession(Number(id));
    if (!game) {
      return reply.status(404).send({ success: false, message: "Game not found" });
    }

    return reply.send({ success: true, game });
  });

  // POST /game/:id/join
  app.post("/:id/join", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: number; nickname: string };

    const session = await gameService.getSession(Number(id));
    if (!session) {
      return reply.status(404).send({ success: false, message: "Session not found" });
    }
    if (session.status !== "LOBBY") {
      return reply.status(400).send({ success: false, message: "Game already started or ended" });
    }
    if (session._count.players >= session.maxPlayers) {
      return reply.status(400).send({ success: false, message: "Session is full" });
    }

    const activeSession = await gameService.findActiveSession(user.id);
    if (activeSession) {
      if (activeSession.status === "PLAYING") {
        // Stale session from a crash or server restart — clean it up so the user can continue
        await gameService.endSession(activeSession.id);
      } else {
        return reply.status(400).send({
          success: false,
          message: "You are already in another session",
          activeSessionId: activeSession.id,
        });
      }
    }

    await gameService.joinSession(session.id, user.id);

    return reply.send({
      success: true,
      message: "You successfully joined the room",
      sessionId: session.id,
    });
  });

  // POST /game/:id/leave
  app.post("/:id/leave", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: number; nickname: string };
    const sessionId = Number(id);

    const session = await gameService.getSession(sessionId);
    if (!session) {
      return reply.status(404).send({ success: false, message: "Session not found" });
    }

    if (session.hostId === user.id) {
      await gameService.deleteSession(sessionId);
      app.io.to(`${sessionId}`).emit("game_deleted");
      app.io.emit("lobby_room_removed", { id });
      return reply.send({ success: true, message: "Session deleted" });
    }

    await gameService.leaveSession(sessionId, user.id);
    return reply.send({ success: true, message: "You successfully left the session" });
  });

  // POST /game/:id/start
  app.post("/:id/start", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: number };
    const sessionId = Number(id);

    const session = await gameService.getSession(sessionId);
    if (!session) {
      return reply.status(404).send({ success: false, message: "Game not found" });
    }
    if (session.hostId !== user.id) {
      return reply.status(403).send({ success: false, message: "Only the host can start the game" });
    }
    if (session._count.players < 2) {
      return reply.status(400).send({ success: false, message: "Not enough players" });
    }

    await gameService.startSession(sessionId);
    app.io.emit("lobby_room_removed", { id });

    return reply.send({
      success: true,
      message: "Game started",
      players: session.players.map((p: any) => p.id),
      gameId: sessionId,
    });
  });

  // POST /game/:id/finish
  app.post("/:id/finish", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { winnerId } = request.body as { winnerId: number };
    const sessionId = Number(id);

    const session = await gameService.getSession(sessionId);
    if (!session) {
      return reply.status(404).send({ success: false, message: "Game not found" });
    }
    if (session.status !== "PLAYING") {
      return reply.status(400).send({ success: false, message: "Game is not in progress" });
    }

    const playerIds = session.players.map((p: any) => p.id);
    await gameService.finishSession(sessionId, winnerId, playerIds);

    return reply.send({ success: true, message: "Game finished, stats updated" });
  });
}
