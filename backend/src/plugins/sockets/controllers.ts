import { OnSocketEvent } from "./socket.decorator.js";
import { Deck } from "../../game/Deck.js";
import { GameState } from "../../game/GameState.js";
import { GameLogger } from "../../game/logger/logger.js";
import { Socket } from "socket.io";
import type { Card } from "../../game/shared.js";
import type { Slot, GameStateSnapshot } from "./socketTypes.js";
import {
  getSlot,
  getTargetIdBySlot,
  buildSnapshot,
  advanceTurn,
  forceDrawCards,
  broadcastTurn,
  peekNext,
} from "./socketFunctions.js";

export class GameController {
  private gameStates = new Map<number, GameState>();
  private gamePlayerIds = new Map<number, number[]>();
  private playerNicknames = new Map<number, string>();
  private gameLoggers = new Map<number, GameLogger>();
  private activeColors = new Map<number, string>();
  private soloCalledBy = new Map<number, number | null>();

  public getLogger(gameId: number): GameLogger | undefined {
    return this.gameLoggers.get(gameId);
  }

  private broadcastState(
    gameId: number,
    playerIds: number[],
    gs: GameState,
    app: any,
  ) {
    for (const pid of playerIds) {
      const snap = buildSnapshot(gs, playerIds, pid, this.playerNicknames);
      app.io.to(`user_${pid}`).emit("game_state", snap);
    }
  }

  private cleanupGame(gameId: number) {
    this.gameStates.delete(gameId);
    this.gamePlayerIds.delete(gameId);
    this.activeColors.delete(gameId);
    this.soloCalledBy.delete(gameId);
  }

  @OnSocketEvent("join_room")
  async handleJoinRoom(socket: Socket, data: any, app: any) {
    try {
      const { gameId, nickname, userId } = data;

      socket.join(`${gameId}`);
      socket.join(`user_${userId}`);
      socket.data.nickname = nickname;
      socket.data.userId = userId;
      socket.data.gameId = gameId;
      this.playerNicknames.set(userId, nickname);

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

      socket
        .to(`${gameId}`)
        .emit("joined_player", { id: String(userId), nickname });

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

      if (session.hostId !== socket.data.userId) {
        return socket.emit("error_message", {
          code: "FORBIDDEN",
          message: "Only the host can start",
        });
      }

      app.io.emit("lobby_room_removed", { id: String(gameId) });

      const deck = new Deck();
      deck.shuffle();
      const playersIds = session.players.map((p: { id: any }) => p.id);
      const gameState = new GameState(playersIds, deck.getCards());

      this.gameStates.set(gameId, gameState);
      this.gamePlayerIds.set(gameId, playersIds);
      this.soloCalledBy.set(gameId, null);

      for (const player of session.players) {
        if (!this.playerNicknames.has(player.id)) {
          this.playerNicknames.set(
            player.id,
            (player as any).nickname ?? `Player ${player.id}`,
          );
        }
      }

      app.io.to(`${gameId}`).emit("game_start_settings", {
        sessionId: gameId,
        playerCount: playersIds.length,
      });

      this.broadcastState(gameId, playersIds, gameState, app);

      const firstId = playersIds[gameState.currentPlayerIndex]!;
      broadcastTurn(playersIds, firstId, app);

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

    const gs = this.gameStates.get(gameId);
    const playerIds = this.gamePlayerIds.get(gameId);
    if (!gs || !playerIds) {
      return socket.emit("error_message", {
        code: "NOT_FOUND",
        message: "Game not found",
      });
    }

    if (userId !== playerIds[gs.currentPlayerIndex]) {
      return socket.emit("error_message", {
        code: "NOT_YOUR_TURN",
        message: "Not your turn",
      });
    }

    const hands: Map<number, Card[]> = (gs as any).playerHands;
    const drawBuffer: number = (gs as any).drawBuffer;
    const activeColor: string | null = this.activeColors.get(gameId) ?? null;

    const hand = hands.get(userId);
    if (!hand) {
      return socket.emit("error_message", {
        code: "NOT_FOUND",
        message: "Player not found",
      });
    }

    if (drawBuffer > 0) {
      if (card.value !== "drawtwo" && card.value !== "wild_draw4") {
        return socket.emit("error_message", {
          code: "MUST_DRAW",
          message: "Draw buffer active — stack a draw card or draw",
        });
      }
      if (gs.topCard.value === "wild_draw4" && card.value === "drawtwo") {
        return socket.emit("error_message", {
          code: "CANNOT_OVERRIDE",
          message: "Cannot stack +2 on +4",
        });
      }
    }

    const cardIdx = hand.findIndex(
      (c) => c.color === card.color && c.value === card.value,
    );
    if (cardIdx === -1) {
      return socket.emit("error_message", {
        code: "CARD_NOT_IN_HAND",
        message: "Card not in hand",
      });
    }

    if (drawBuffer === 0) {
      const effectiveColor = activeColor ?? gs.topCard.color;
      const playable =
        card.color === "wild" ||
        card.color === effectiveColor ||
        card.value === gs.topCard.value;

      if (!playable) {
        return socket.emit("error_message", {
          code: "INVALID_CARD",
          message: "Cannot play this card",
        });
      }
    }

    hand.splice(cardIdx, 1);
    const discard: Card[] = (gs as any).discard_deck;
    discard.push(gs.topCard);
    gs.topCard = card;
    this.activeColors.delete(gameId);
    this.soloCalledBy.set(gameId, null);

    let waitForColor = false;

    switch (card.value) {
      case "skip":
        advanceTurn(gs, playerIds, 2);
        break;

      case "reverse":
        gs.direction = (gs.direction * -1) as 1 | -1;
        advanceTurn(gs, playerIds, 1);
        break;

      case "drawtwo":
        (gs as any).drawBuffer += 2;
        advanceTurn(gs, playerIds, 1);
        break;

      case "wild_draw4":
        (gs as any).drawBuffer += 4;
        waitForColor = true;
        break;

      case "wild":
        waitForColor = true;
        break;

      default:
        advanceTurn(gs, playerIds, 1);
        break;
    }

    for (const pid of playerIds) {
      if (pid === userId) continue;
      const slot = getSlot(playerIds, pid, userId) as Slot;
      app.io.to(`user_${pid}`).emit("card_played", { slot, card });
    }

    if (hand.length === 0) {
      const nickname = this.playerNicknames.get(userId) ?? `Player ${userId}`;
      app.io
        .to(`${gameId}`)
        .emit("game_finished", { winnerId: userId, winnerNickname: nickname });
      this.gameLoggers
        .get(gameId)
        ?.system("GAME_FINISHED", `Player ${nickname} won game ${gameId}`);
      this.cleanupGame(gameId);
      return;
    }

    this.broadcastState(gameId, playerIds, gs, app);

    if (!waitForColor) {
      broadcastTurn(playerIds, playerIds[gs.currentPlayerIndex]!, app);
    }

    const logger = this.gameLoggers.get(gameId);

    logger?.log(
      userId,
      "PLAY_CARD",
      `Played ${card.color.toUpperCase()} ${card.value}. Next player turn.`,
    );
  }

  @OnSocketEvent("draw_card")
  async handleDrawCard(socket: Socket, data: any, app: any) {
    const { gameId, userId } = data as { gameId: number; userId: number };

    const gs = this.gameStates.get(gameId);
    const playerIds = this.gamePlayerIds.get(gameId);
    if (!gs || !playerIds) {
      return socket.emit("error_message", {
        code: "NOT_FOUND",
        message: "Game not found",
      });
    }

    if (userId !== playerIds[gs.currentPlayerIndex]) {
      return socket.emit("error_message", {
        code: "NOT_YOUR_TURN",
        message: "Not your turn",
      });
    }

    const drawBuffer: number = (gs as any).drawBuffer;
    const count = drawBuffer > 0 ? drawBuffer : 1;

    const drawn = forceDrawCards(gs, userId, count);

    if (drawBuffer > 0) {
      (gs as any).drawBuffer = 0;
    }

    socket.emit("cards_drawn", { cards: drawn });

    for (const pid of playerIds) {
      if (pid === userId) continue;
      const slot = getSlot(playerIds, pid, userId) as Slot;
      app.io
        .to(`user_${pid}`)
        .emit("player_drew", { slot, count: drawn.length });
    }

    advanceTurn(gs, playerIds, 1);
    this.broadcastState(gameId, playerIds, gs, app);
    broadcastTurn(playerIds, playerIds[gs.currentPlayerIndex]!, app);

    this.gameLoggers
      .get(gameId)
      ?.log(userId, "DRAW_CARD", `Player drew ${drawn.length} card(s).`);
  }

  @OnSocketEvent("choose_color")
  async handleChooseCard(socket: Socket, data: any, app: any) {
    const { gameId, userId, color } = data as {
      gameId: number;
      userId: number;
      color: string;
    };

    const gs = this.gameStates.get(gameId);
    const playerIds = this.gamePlayerIds.get(gameId);
    if (!gs || !playerIds) return;

    this.activeColors.set(gameId, color);

    advanceTurn(gs, playerIds, 1);

    app.io.to(`${gameId}`).emit("color_chosen", { color });

    this.broadcastState(gameId, playerIds, gs, app);
    broadcastTurn(playerIds, playerIds[gs.currentPlayerIndex]!, app);

    this.gameLoggers
      .get(gameId)
      ?.log(userId, "CHOOSE_COLOR", `Player chose ${color.toUpperCase()}.`);
  }

  @OnSocketEvent("say_solo")
  async handleSaySolo(socket: Socket, data: any, app: any) {
    const { gameId, userId } = data as { gameId: number; userId: number };

    this.soloCalledBy.set(gameId, userId);

    socket.to(`${gameId}`).emit("solo_called", { playerId: userId });

    this.gameLoggers
      .get(gameId)
      ?.log(userId, "SAY_SOLO", `Player yelled SOLO!`);
  }

  @OnSocketEvent("catch_solo")
  async handleSoloPunishment(socket: Socket, data: any, app: any) {
    const { gameId, userId, slot } = data as {
      gameId: number;
      userId: number;
      slot: Slot;
    };

    const gs = this.gameStates.get(gameId);
    const playerIds = this.gamePlayerIds.get(gameId);
    if (!gs || !playerIds) return;

    const targetId = getTargetIdBySlot(playerIds, userId, slot);
    if (!targetId) return;

    const soloCallerId = this.soloCalledBy.get(gameId);

    if (soloCallerId === targetId) {
      const drawn = forceDrawCards(gs, userId, 2);
      socket.emit("cards_drawn", { cards: drawn });
      for (const pid of playerIds) {
        if (pid === userId) continue;
        const s = getSlot(playerIds, pid, userId) as Slot;
        app.io
          .to(`user_${pid}`)
          .emit("player_drew", { slot: s, count: drawn.length });
      }
      this.gameLoggers
        .get(gameId)
        ?.log(
          userId,
          "CATCH_SOLO_FAIL",
          `Player ${userId} tried to catch ${targetId} but they had called SOLO — catcher penalised.`,
        );
    } else {
      const drawn = forceDrawCards(gs, targetId, 2);
      app.io.to(`user_${targetId}`).emit("cards_drawn", { cards: drawn });
      for (const pid of playerIds) {
        if (pid === targetId) continue;
        const s = getSlot(playerIds, pid, targetId) as Slot;
        app.io
          .to(`user_${pid}`)
          .emit("solo_catch_result", { slot: s, count: drawn.length });
      }
      this.gameLoggers
        .get(gameId)
        ?.log(
          userId,
          "CATCH_SOLO",
          `Player ${userId} caught player ${targetId} without SOLO — target penalised.`,
        );
    }

    this.broadcastState(gameId, playerIds, gs, app);
  }
}
