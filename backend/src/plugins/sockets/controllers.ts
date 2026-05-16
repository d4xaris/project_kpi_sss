import { OnSocketEvent } from "./socket.decorator.js";
import { Deck } from "../../game/Deck.js";
import { GameState } from "../../game/GameState.js";
import type { Card } from "../../game/shared.js";
import { GameLogger } from "../../game/logger/logger.js";
import { Socket } from "socket.io";

export class GameController {
  private gameStates = new Map<number, GameState>();
  private gameLoggers = new Map<number, GameLogger>();

  public getLogger(gameId: number): GameLogger | undefined {
    return this.gameLoggers.get(gameId);
  }

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
      const logger = this.gameLoggers.get(gameId);
      logger?.log(
        userId,
        "PLAYER_JOINED",
        `Player ${nickname} joined game ${gameId}.`,
      );
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
      const logger = this.gameLoggers.get(gameId);
      logger?.log(
        userId,
        "PLAYER_LEFT",
        `Player ${nickname} left game ${gameId}.`,
      );
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

      const deck = new Deck();
      deck.shuffle();
      const playersIds = session.players.map((p: { id: any }) => p.id);
      const gameState = new GameState(playersIds, deck.getCards());
      this.gameStates.set(gameId, gameState);

      for (const player of session.players) {
        const socketId = null;
        // need to add some code when it will be possible
        // const hand = gameState.
        // app.io.to(`user_${player.id}`).emit("player_hand", {cards: hand});
      }

      app.io.to(`${gameId}`).emit("game_start_settings", {
        players: playersIds,
        status: "PLAYING",
        gameSettings: {
          topCard: gameState.topCard,
          currentPlayerIndex: gameState.currentPlayerIndex,
          direction: gameState.direction,
        },
      });

      const logger = new GameLogger(gameId);
      this.gameLoggers.set(gameId, logger);

      logger.system(
        "GAME_STARTED",
        `Log session initialized for game ${gameId}`,
      );
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

    const logger = this.gameLoggers.get(gameId);

    logger?.log(
      userId,
      "PLAY_CARD",
      `Played ${card.color.toUpperCase()} ${card.value}. Next player turn.`,
    );
  }

  @OnSocketEvent("draw_card")
  async handleDrawCard(socket: Socket, data: any, app: any) {
    const { gameId, userId } = data;

    const logger = this.gameLoggers.get(gameId);
    logger?.log(userId, "DRAW_CARD", `Player drew 1 card from deck.`);
  }

  @OnSocketEvent("choose_color")
  async handleChooseCard(socket: Socket, data: any, app: any) {
    const { gameId, userId, color } = data;

    const logger = this.gameLoggers.get(gameId);
    logger?.log(
      userId,
      "CHOOSE_COLOR",
      `Player chose color ${color.toUpperCase()}.`,
    );
  }

  @OnSocketEvent("say_solo")
  async handleSaySolo(socket: Socket, data: any, app: any) {
    const { gameId, userId } = data;

    const logger = this.gameLoggers.get(gameId);
    logger?.log(userId, "SAY_SOLO", `Player yelled SOLO!`);
  }

  @OnSocketEvent("catch_solo")
  async handleSoloPunishment(socket: Socket, data: any, app: any) {
    const { gameId, userId, targetId } = data;

    const logger = this.gameLoggers.get(gameId);
    logger?.log(
      userId,
      "CATCH_SOLO",
      `Player ${userId} caught Player ${targetId} without SOLO.`,
    );
  }
}
