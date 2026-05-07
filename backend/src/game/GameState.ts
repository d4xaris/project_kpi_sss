import {type ActionResult, type Card} from "./shared.js";
import {canPlayCards} from "./rules.js";
//import {Deck} from "./Deck.js";


export class GameState {
    private deck: Card[];
    private playerIds: number[];
    private playerHands: Map<number, Card[]>;
    direction = 1 | -1;
    private discard_deck= [];
    currentPlayerIndex = 0;
    private drawBuffer = 0;
    topCard: Card;
    //логіка стола і гравців
    constructor(ids: number[], startingCards: Card[]) {
        //все що пов'язано с картами и колодою карт
        this.deck = startingCards;
        this.discard_deck = [];
        //перша карта та сума штраф карт
        this.direction = 1;
        this.drawBuffer = 0;
        //гравець і все що з ним пов'язано
        this.playerIds = ids;
        this.playerHands = new Map();
        this.currentPlayerIndex = 0;

        const not_card = ['reverse','skip','drawtwo' ,'wild' ,'wild_draw4']
        while (true) {
            let FirstCard = startingCards.shift();
            if(FirstCard) {
                if (not_card.includes(FirstCard.value)) {
                    startingCards.push(FirstCard);
                }else{
                    this.topCard = FirstCard;
                    break;
                }

            }
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
     public playCard(playerIds: number,card: Card):ActionResult {
        if (playerIds !== this.currentPlayerIndex) {
            return { success: false, reason: 'NOT_YOUR_TURN' };
        }
        let hand = this.playerHands.get(playerIds);
         if (!hand) {
                return { success: false, reason: 'PLAYER_NOT_FOUND' };
         }
         return {success: true };
         if (!canPlayCards(card, this.topCard)) {
             return { success: false, reason: 'INVALID_CARD' };
         }
         
     }
}
