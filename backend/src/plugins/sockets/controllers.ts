import { OnSocketEvent } from "./socket.decorator.js";
import { Deck } from "../../game/Deck.js";
import { GameState } from "../../game/GameState.js";
import type { Card } from "../../game/shared.js";
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

  private gameStates = new Map<number, GameState>();

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

      const deck = new Deck();
      deck.shuffle();

      const playersIds = session.players.map((p: { id: any }) => p.id);
      const gameState = new GameState(playersIds, deck.getCards());

      this.gameStates.set(gameId, gameState);

      app.io.to(`${gameId}`).emit("game_start_settings", {
        players: playersIds,
        status: "PLAYING",
        gameSettings: {
          topCard: gameState.topCard,
          currentPlayerIndex: gameState.currentPlayerIndex,
          direction: gameState.direction,
        },
      });
    } catch (err) {
      app.log.error(err);
      socket.emit("error_message", {
        message: "Failed to start the game",
      });
    }
  }

  @OnSocketEvent("play_card")
  async handlePlayCard(socket: Socket, data: any, app: any) {
    const { gameId, userId, card } = data;

    try {
      const gameState = this.gameStates.get(gameId);
      if (!gameState) {
        return socket.emit("error_message", {
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      const res = gameState.playCard(userId, card);

      if (!res.success) {
        return socket.emit("error_message", {
          code: res.reason,
          message: res.reason,
        });
      }

      app.io.to(`${gameId}`).emit("card_played", {
        playerId: userId,
        card,
        topCard: gameState.topCard,
        currentPlayerIndex: gameState.currentPlayerIndex,
        direction: gameState.direction,
      });
    } catch (err) {
      app.log.error(err);
      socket.emit("error_message", {
        message: "Failed to start the game",
      });
    }
  }
}
