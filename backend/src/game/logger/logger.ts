import fs from "fs";
import path from "path";
import { Writable, Transform } from "stream";
import type { LogAction, LogEntry } from "./logTypes.js";

class LogFormatter extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(entry: LogEntry, _encoding: string, callback: () => void) {
    const line = `[${entry.timestamp}] [PL:${entry.player}] [ACTION:${entry.action}] - ${entry.message}\n`;
    this.push(line);
    callback();
  }
}

export class GameLogger {
  private formatter: LogFormatter;
  private fileStream: Writable;
  private gameId: number;

  constructor(gameId: number) {
    this.gameId = gameId;

    const logsDir = path.resolve("logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.formatter = new LogFormatter();

    this.fileStream = fs.createWriteStream(
      path.join(logsDir, `game-${gameId}.log`),
      { flags: "a" },
    );

    this.formatter.pipe(this.fileStream);
  }

  log(player: string | number, action: LogAction, message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      player: String(player),
      action,
      message,
    };

    this.formatter.write(entry);
  }

  system(action: LogAction, message: string) {
    this.log("SYSTEM", action, message);
  }

  close() {
    this.system("GAME_FINISHED", "Game finished. Closing log stream.");
    this.formatter.end(() => {
      this.fileStream.end();
    });
  }
}
