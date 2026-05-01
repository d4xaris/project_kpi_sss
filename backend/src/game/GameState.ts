import {type Card} from "./Deck.js";
import {Deck} from "./Deck.js";
export class GameState {
    private deck: Card[];
    private playerIds: number[];
    private playerHands: Map<number, Card[]>;

    constructor(ids: number[], startingCards: Card[]) {
        this.deck = startingCards;
        this.playerIds = ids;
        this.playerHands = new Map();
        for (const ids of this.playerIds) {
            const hand = this.deck.splice(0, 7);
            this.playerHands.set(ids, hand);
        }
    };
    *turn_generator(player: number[]) {
    let currentIndex= 0;
    while (true) {
        yield player[currentIndex];
    }
    }
}
