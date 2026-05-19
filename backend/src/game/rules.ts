import { type Card } from "./shared.js";
import { memoize } from "./memo.js";

function _canPlayCards(topCard: Card, hand: Card): boolean {
    if (hand.color === topCard.color) return true;
    if (hand.color === "wild") return true;
    if (hand.value === topCard.value) return true;
    return false;
}

export const canPlayCards = memoize(_canPlayCards, { maxSize: 512, policy: 'lru' });
