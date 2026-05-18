import {type ActionResult, type Card} from "./shared.js";
import {canPlayCards} from "./rules.js";
import {Deck} from "./Deck.js";

export class GameState {
    private deck: Card[];
    private playerIds: number[];
    private playerHands: Map<number, Card[]>;
    direction: 1 | -1 = 1;
    private discard_deck: Card[] = [];
    currentPlayerIndex = 0;
    private drawBuffer = 0;
    pendingDraws: number = 0;
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

    private reshuffleDiscardIntoDeck() {
        if (this.discard_deck.length > 0) {
            const topCard = this.discard_deck.pop()!;
            this.deck = this.discard_deck;
            this.discard_deck = [topCard];
            Deck.shuffle(this.deck);
        }
    }
    public drawCard(playerId: number): ActionResult {
        if (playerId !== this.playerIds[this.currentPlayerIndex]) {
            return { success: false, reason: 'NOT_YOUR_TURN' };
        }
        let amountToDraw = this.pendingDraws > 0 ? this.pendingDraws : 1;
        let drawnCards = this.deck.splice(0, amountToDraw);

        if (drawnCards.length < amountToDraw) {
            this.reshuffleDiscardIntoDeck();

            const remainingCount = amountToDraw - drawnCards.length;

            const extraCards = this.deck.splice(0, remainingCount);
            drawnCards = drawnCards.concat(extraCards);
        }

        const hand = this.playerHands.get(playerId);
        if (hand) {
            hand.push(...drawnCards);
        }

        if (this.pendingDraws > 0) {
            this.pendingDraws = 0;
        }

        this.advanceTurn();
        return { success: true };
    }
     public playCard(playerIds: number,card: Card):ActionResult {
         const activePlayerId = this.playerIds[this.currentPlayerIndex];
         if (this.drawBuffer > 0) {
             if (card.value !== 'drawtwo' && card.value !== 'wild_draw4') {
                 return {success: false, reason: 'CANNOT_PLAY_DRAW_CARD'};
             }
             if (this.topCard.value === 'wild_draw4'&& card.value === 'drawtwo'){
                 return {success: false , reason:'CANNOT_OVERRIDE_DRAW4_WITH_DRAW2'}
             }
         }
        if (this.drawBuffer === 0){
            return {success: false, reason: 'DRAW_BUFFER_ACTIVE'};
        }
         if (playerIds !== activePlayerId) {
             return {success: false, reason: 'NOT_YOUR_TURN'};
         }//first check
        const hand = this.playerHands.get(playerIds);
         if (!hand) {
                return { success: false, reason: 'PLAYER_NOT_FOUND' };
         }//second check
         const cardIndex = hand.findIndex(c => c.color === card.color && c.value === card.value);
         if (cardIndex === -1) {
             return { success: false, reason: 'CARD_NOT_IN_HAND' };
         }
         if (!canPlayCards(card, this.topCard)) {
             return {success: false, reason: 'INVALID_CARD'};
         }
         hand.splice(cardIndex, 1);
         this.discard_deck.push(this.topCard);
         this.topCard = card;
         this.applyCardEffect(card);
         return {success: true};
     }
     private advanceTurn() {
         this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.playerIds.length) % this.playerIds.length;
     }
    private applyCardEffect(card: Card): void {
        switch (card.value) {
            case 'skip':
                this.advanceTurn();
                this.advanceTurn();
                break;
            case 'reverse':
                this.direction *= -1;
                this.advanceTurn();
                break;
            case 'drawtwo':
                this.pendingDraws += 2;
                this.advanceTurn();
                break;

            case 'wild_draw4':
                this.pendingDraws += 4;
                this.advanceTurn();
                break;
            case 'wild':
            case 'troll':
                // Color change is handled by the caller (GameRoom)
                this.advanceTurn();
                break;
            default:
                this.advanceTurn();
        }
    }

}
