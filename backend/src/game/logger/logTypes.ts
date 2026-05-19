export type LogAction =
  | "GAME_STARTED"
  | "GAME_FINISHED"
  | "PLAY_CARD"
  | "DRAW_CARD"
  | "SKIP_TURN"
  | "REVERSE"
  | "CHOOSE_COLOR"
  | "SAY_SOLO"
  | "CATCH_SOLO"
  | "CATCH_SOLO_FAIL"
  | "VICTORY"
  | "PLAYER_JOINED"
  | "PLAYER_LEFT";

export interface LogEntry {
  timestamp: string;
  player: string;
  action: string;
  message: string;

}
