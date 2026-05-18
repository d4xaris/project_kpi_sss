import { GameState } from "../../game/GameState.js";
import type { Card } from "../../game/shared.js";
import type { Slot, GameStateSnapshot } from "./socketTypes.js";

export function getSlot(
  playerIds: number[],
  viewerId: number,
  targetId: number,
): "player" | Slot {
  if (viewerId === targetId) return "player";
  const count = playerIds.length;
  const diff =
    (playerIds.indexOf(targetId) - playerIds.indexOf(viewerId) + count) % count;
  if (count === 2) return "top";
  if (count === 3) return diff === 1 ? "top" : "right";
  if (diff === 1) return "left";
  if (diff === 2) return "top";
  return "right";
}

export function getTargetIdBySlot(
  playerIds: number[],
  viewerId: number,
  slot: Slot,
): number | undefined {
  const count = playerIds.length;
  const viewerIdx = playerIds.indexOf(viewerId);
  if (viewerIdx === -1) return undefined;

  let offset: number;
  if (count === 2) {
    offset = 1;
  } else if (count === 3) {
    offset = slot === "top" ? 1 : 2;
  } else {
    if (slot === "left") offset = 1;
    else if (slot === "top") offset = 2;
    else offset = 3;
  }

  return playerIds[(viewerIdx + offset) % count];
}

export function buildSnapshot(
  gs: GameState,
  playerIds: number[],
  forPlayerId: number,
  nicknames: Map<number, string>,
): GameStateSnapshot {
  const hands = (gs as any).playerHands as Map<number, Card[]>;
  const counts: Record<number, number> = {};
  for (const [id, hand] of hands) counts[id] = hand.length;

  const opponents: GameStateSnapshot["opponents"] = {};
  for (const pid of playerIds) {
    if (pid === forPlayerId) continue;
    const slot = getSlot(playerIds, forPlayerId, pid);
    if (slot !== "player") {
      opponents[slot] = {
        nickname: nicknames.get(pid) ?? `Player ${pid}`,
        cardCount: counts[pid] ?? 0,
      };
    }
  }

  const currentId = playerIds[gs.currentPlayerIndex]!;

  return {
    yourHand: hands.get(forPlayerId) ?? [],
    topCard: gs.topCard,
    currentTurn: getSlot(playerIds, forPlayerId, currentId),
    direction: gs.direction as 1 | -1,
    opponents,
  };
}

export function advanceTurn(
  gs: GameState,
  playerIds: number[],
  steps: number,
): void {
  const count = playerIds.length;
  const dir = gs.direction as 1 | -1;
  gs.currentPlayerIndex =
    (((gs.currentPlayerIndex + dir * steps) % count) + count) % count;
}

export function peekNext(
  gs: GameState,
  playerIds: number[],
  steps = 1,
): number {
  const count = playerIds.length;
  const dir = gs.direction as 1 | -1;
  const idx = (((gs.currentPlayerIndex + dir * steps) % count) + count) % count;
  return playerIds[idx]!;
}

export function forceDrawCards(
  gs: GameState,
  playerId: number,
  count: number,
): Card[] {
  const deck = (gs as any).deck as Card[];
  const hands = (gs as any).playerHands as Map<number, Card[]>;
  const drawn = deck.splice(0, Math.min(count, deck.length));
  const hand = hands.get(playerId) ?? [];
  hand.push(...drawn);
  hands.set(playerId, hand);
  return drawn;
}

export function broadcastTurn(
  playerIds: number[],
  nextId: number,
  app: any,
): void {
  for (const pid of playerIds) {
    const turn = getSlot(playerIds, pid, nextId);
    app.io.to(`user_${pid}`).emit("game_turn", { turn });
  }
}
