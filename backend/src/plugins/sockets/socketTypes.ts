import type { Card } from "../../game/shared.js";

export type Slot = "top" | "left" | "right";

export interface GameStateSnapshot {
  yourHand: Card[];
  topCard: Card;
  currentTurn: "player" | Slot;
  direction: 1 | -1;
  drawBuffer: number;
  opponents: {
    top?: { nickname: string; cardCount: number };
    left?: { nickname: string; cardCount: number };
    right?: { nickname: string; cardCount: number };
  };
}

export interface ClientToServer {
  join_room: (data: {
    gameId: number;
    nickname: string;
    userId: number;
  }) => void;
  leave_room: (data: {
    gameId: number;
    nickname: string;
    userId: number;
  }) => void;
  game_start_request: (data: { gameId: number }) => void;
  play_card: (data: { gameId: number; userId: number; card: Card }) => void;
  draw_card: (data: { gameId: number; userId: number }) => void;
  choose_color: (data: {
    gameId: number;
    userId: number;
    color: string;
  }) => void;
  say_solo: (data: { gameId: number; userId: number }) => void;
  catch_solo: (data: { gameId: number; userId: number; slot: Slot }) => void;
}

export interface ServerToClient {
  // lobby
  lobby_room_updated: (data: { id: string; playerCount: number }) => void;
  lobby_room_removed: (data: { id: string }) => void;
  room_created: (data: {
    roomId: string;
    roomName: string;
    playerCount: number;
    maxPlayers: number;
  }) => void;
  // room
  joined_player: (data: { id: string; nickname: string }) => void;
  current_players: (players: any[]) => void;
  player_left: (data: { socketId: string; nickname?: string }) => void;
  game_deleted: () => void;
  // navigation
  game_start_settings: (data: {
    sessionId: number;
    playerCount: number;
  }) => void;
  // status
  game_state: (snapshot: GameStateSnapshot) => void;
  // in-game
  game_turn: (data: { turn: "player" | Slot }) => void;
  card_played: (data: { slot: Slot; card: Card }) => void;
  cards_drawn: (data: { cards: Card[] }) => void;
  player_drew: (data: { slot: Slot; count: number }) => void;
  color_chosen: (data: { color: string }) => void;
  game_finished: (data: { winnerId: number; winnerNickname: string }) => void;
  error_message: (data: { code?: string; message: string }) => void;
  say_solo: (data: { userId: number }) => void;
  catch_solo_result: (data: { caught: boolean; catcherId: number }) => void;
  choose_color_prompt: (data: Record<string, never>) => void;
}

export interface SocketData {
  userId: number;
  nickname: string;
  gameId: number;
}
