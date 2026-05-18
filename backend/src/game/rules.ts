import { type Card } from "./shared.js";
import { memoize } from "./memo.js";

function _canPlayCards(topCard: Card, hand: Card): boolean {
    if (hand.color === topCard.color) return true;
    if (hand.color === "wild") return true;
    if (hand.value === topCard.value) return true;
    return false;
}

// Memoized version — same logic, results cached by (topCard, hand) pair.
// Uses LRU eviction with a 512-entry cache to avoid redundant checks
// during a game where the same card combinations come up repeatedly.
export const canPlayCards = memoize(_canPlayCards, { maxSize: 512, policy: 'lru' });
