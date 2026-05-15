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
}

export interface SocketData {
  nickname: string;
  userId: number;
  gameId: number;
}
