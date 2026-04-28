import {type Card} from "./Deck.js";
import {Deck} from "./Deck.js";
export class GameState {
    private playerHands: Map<number, Card[]>;
    constructor(ids: string[], deck: Deck) {
        this.playerHands = new Map<number,Card[]>();

    }
}
