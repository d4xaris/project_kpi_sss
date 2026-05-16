import type { Card } from "../../game/shared.js";

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
  draw_card: (data: {}) => void;
  choose_color: (data: {}) => void;
  say_solo: (data: {}) => void;
  catch_solo: (data: {}) => void;
}

export interface ServerToClient {
  joined_player: (data: { id: string; nickname: string }) => void;
  current_players: (players: any[]) => void;
  error_message: (data: { code?: string; message: string }) => void;
  player_left: (data: { socketId: string; nickname?: string }) => void;
  game_deleted: () => void;
  game_start_settings: (data: {
    players: number[];
    status: string;
    gameSettings: {};
  }) => void;
  game_finished: (data: { winnerId: number }) => void;
  room_created: (data: {
    roomId: string;
    roomName: string;
    playerCount: number;
    maxPlayers: number;
  }) => void;
  lobby_room_removed: (data: { id: string }) => void;
  lobby_room_updated: (data: { id: string; playerCount: number }) => void;
  card_played: (data: {
    playerId: number;
    card: Card;
    topCard: Card;
    currentPlayerIndex: number;
    direction: 1 | -1;
  }) => void;
  player_hand: (data: { cards: Card[] }) => void;
  game_state: (data: {}) => void;
  cards_drawn: (data: {}) => void;
  player_drew: (data: {}) => void;
  color_chosen: (data: {}) => void;
  choose_color_prompt: (data: {}) => void;
  turn_skipped: (data: {}) => void;
  solo_called: (data: {}) => void;
  solo_catch_result: (data: {}) => void;
}

export interface SocketData {
  nickname: string;
  userId: number;
  gameId: number;
}
