import {type Card} from "./Deck.js";
import {Deck} from "./Deck.js";
import type {Direction} from "node:tty";
export class GameState {
    private deck: Card[];
    private playerIds: number[];
    private playerHands: Map<number, Card[]>;
    direction = 1 | -1;
    private discard_deck= [];
    currentPlayerIndex = 0;
    drawBuffer = 0;
    constructor(ids: number[], startingCards: Card[]) {
        this.deck = startingCards;
        this.playerIds = ids;
        this.playerHands = new Map();
        this.currentPlayerIndex = 0;
        this.direction = 1;

        while (startingCards.slice(1)) {

        }
            for (const ids of this.playerIds) {
            const hand = this.deck.splice(0, 7);
            this.playerHands.set(ids, hand);
        }

    };
    // *turn_generator(player: number[]) {
    // let currentIndex= 0;
    // while (true) {
    //     yield player[currentIndex];
    // }
    // }
}
