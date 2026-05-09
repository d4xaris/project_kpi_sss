export interface ClientToServer {
  join_room: (data: { gameId: number; nickname: string }) => void;
}

export interface ServerToClient {
  joined_player: (data: { id: string; nickname: string }) => void;
  current_players: (players: any[]) => void;
  error_message: (data: { code?: string; message: string }) => void;
  player_left: (data: { socketId: string; nickname?: string }) => void;
  game_deleted: () => void;
  game_start: (data: { players: number[]; status: string }) => void;
  // for game_start will be added gameSettings
  game_finished: (data: { winnerId: number }) => void;
  room_created: (data: {
    roomId: string;
    roomName: string;
    playerCount: number;
    maxPlayers: number;
  }) => void;
  lobby_room_removed: (data: { id: string }) => void;
  lobby_room_updated: (data: { id: string; playerCount: number }) => void;
}
