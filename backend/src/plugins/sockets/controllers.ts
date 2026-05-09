import { OnSocketEvent } from "./socket.decorator.js";
import { Deck } from "../../game/Deck.js";
import { GameState } from "../../game/GameState.js";
import { Socket } from "socket.io";

export class GameController {
  @OnSocketEvent("join_room")
  async handleJoinRoom(socket: Socket, data: any, app: any) {
    try {
      const { gameId, nickname, userId } = data;

      socket.join(`${gameId}`);
      socket.data.nickname = nickname;
      socket.data.userId = userId;
      socket.data.gameId = gameId;

      const session = await app.prisma.gameSession.findUnique({
        where: { id: gameId },
        include: {
          _count: {
            select: {
              players: true,
            },
          },
          players: true,
        },
      });

      if (!session) {
        return socket.emit("error_message", {
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      app.io.to(`${gameId}`).emit("joined_player", {
        id: String(userId),
        nickname: nickname,
      });

      app.io.emit("lobby_room_updated", {
        id: String(gameId),
        playerCount: session._count.players,
      });

      socket.emit("current_players", session.players);
    } catch (err) {
      app.log.error(err);
      socket.emit("error_message", {
        message: "An error has occured",
      });
    }
  }

  @OnSocketEvent("leave_room")
  async handleLeaveRoom(socket: Socket, data: any, app: any) {
    try {
      const { gameId, nickname, userId } = data;

      socket.leave(`${gameId}`);
      socket.data.nickname = nickname;
      socket.data.userId = userId;
      socket.data.gameId = gameId;

      const session = await app.prisma.gameSession.findUnique({
        where: { id: gameId },
        include: {
          _count: {
            select: {
              players: true,
            },
          },
          players: true,
        },
      });

      if (!session) {
        return socket.emit("error_message", {
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      app.io.to(`${gameId}`).emit("player_left", {
        socketId: String(userId),
        nickname: nickname,
      });

      app.io.emit("lobby_room_updated", {
        id: String(gameId),
        playerCount: session._count.players,
      });
    } catch (err) {
      app.log.error(err);
      socket.emit("error_message", {
        message: "An error has occured",
      });
    }
  }

  @OnSocketEvent("game_start_request")
  async handleGameStart(socket: Socket, data: any, app: any) {
    const { gameId } = data;

    try {
      const session = await app.prisma.gameSession.findUnique({
        where: { id: gameId },
        include: { players: true },
      });

      if (!session) {
        return socket.emit("error_message", {
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      const playersIds = session.players.map((p: { id: any }) => p.id);

      // const room = new Game
      const gameSettings = {};

      app.io.to(`${gameId}`).emit("game_start_settings", {
        players: playersIds,
        status: "Playing",
        gameSettings: gameSettings,
      });
    } catch (err) {
      app.log.error(err);
    }
  }
}
