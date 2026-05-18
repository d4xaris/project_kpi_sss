import { BiDiPriorityQueue } from "./BiDiPriorityQueue.js";
interface PendingAction {
  type:     'draw';
  targetId: number;
  amount:   number;
}

export class GameRoom {
  private players: number[] = [];
  private actionQueue = new BiDiPriorityQueue<PendingAction>();

  constructor(ids: number[]) {
    this.players = ids;
  }

  pushDrawAction(targetId: number, amount: number): void {
    this.actionQueue.enqueue({ type: 'draw', targetId, amount }, amount);
  }

  resolveNext(): PendingAction | undefined {
    return this.actionQueue.dequeue('highest');
  }

  peekLowest(): PendingAction | undefined {
    return this.actionQueue.peek('lowest');
  }

  peekOldest(): PendingAction | undefined {
    return this.actionQueue.peek('oldest');
  }

  hasPendingActions(): boolean {
    return !this.actionQueue.isEmpty;
  }

  getPlayers(): number[] {
    return this.players;
  }
}
