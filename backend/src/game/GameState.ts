import {type Card} from "./Deck.js";
import {Deck} from "./Deck.js";
export class GameState {
    ids = [1, 2, 3];
    private deck: Card[];
    private id = this.ids;
    private playerIds: number[];
    private playerHands: Map<number, Card[]>;

    constructor(ids: number[], startingCards: Card[]) {
        this.deck = startingCards;
        this.playerIds = ids;
        this.playerHands = new Map();
    };
}