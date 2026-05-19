import {type ActionResult, type Card, type CardColor} from "./shared.js";
import {canPlayCards} from "./rules.js";



export class GameState {
    private deck: Card[];
    private playerIds: number[];
    private playerHands: Map<number, Card[]>;
    direction: 1 | -1 = 1;
    private discard_deck: Card[] = [];
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
    private reshuffleDiscardIntoDeck() {
        if (this.discard_deck.length === 0) return;
        // Move discard pile back into deck and shuffle it
        this.deck = this.discard_deck;
        this.discard_deck = [];
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j]!, this.deck[i]!];
        }
    }

    drawCards(playerId: number, count: number) {
        const hand = this.playerHands.get(playerId);
        if (!hand) return;
        // Refill deck from discard if running low
        if (this.deck.length < count) {
            this.reshuffleDiscardIntoDeck();
        }
        const actual = Math.min(count, this.deck.length);
        const drawn = this.deck.splice(0, actual);
        hand.push(...drawn);
        // Clear any pending draw penalty
        this.drawBuffer = 0;
        // Drawing ends your turn
        this.advanceTurn();
    }

     public playCard(playerIds: number, card: Card, activeColor?: string | null): ActionResult {
         const activePlayerId = this.playerIds[this.currentPlayerIndex];
         if (this.drawBuffer > 0) {
             if (card.value !== 'drawtwo' && card.value !== 'wild_draw4') {
                 return {success: false, reason: 'CANNOT_PLAY_DRAW_CARD'};
             }
             if (this.topCard.value === 'wild_draw4' && card.value === 'drawtwo'){
                 return {success: false, reason: 'CANNOT_OVERRIDE_DRAW4_WITH_DRAW2'};
             }
         }
         if (playerIds !== activePlayerId) {
             return {success: false, reason: 'NOT_YOUR_TURN'};
         }
         const hand = this.playerHands.get(playerIds);
         if (!hand) {
             return { success: false, reason: 'PLAYER_NOT_FOUND' };
         }
         const cardIndex = hand.findIndex(c => c.color === card.color && c.value === card.value);
         if (cardIndex === -1) {
             return { success: false, reason: 'CARD_NOT_IN_HAND' };
         }
         // When top card is wild, use the active chosen color for validation
         const effectiveTop = (this.topCard.color === 'wild' && activeColor)
             ? { ...this.topCard, color: activeColor as CardColor }
             : this.topCard;
         if (!canPlayCards(effectiveTop, card)) {
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
     private applyCardEffect(card: any) {
         switch (card.value) {
             case 'skip':
                 this.advanceTurn()
                 this.advanceTurn();
                 break
             case 'reverse':
                 this.direction *= -1;
                 // In a 2-player game, reverse acts like a skip: same player goes again
                 if (this.playerIds.length === 2) this.advanceTurn();
                 this.advanceTurn();
                 break
             case 'drawtwo':
                 this.drawBuffer += 2;
                 this.advanceTurn()
                 break
             case 'wild_draw4':
                    this.drawBuffer += 4;
                    this.advanceTurn()
                 break
             case 'wild':
                 this.advanceTurn();
                 break;
             default:
                 this.advanceTurn();
                 break;
         }
         }

    isGameOver(): boolean {
        for (const [, hand] of this.playerHands) {
            if (hand.length === 0) return true;
        }
        return false;
    }
    getResult(): { winner: number } | null {

        for (const [playerId, hand] of this.playerHands) {
            if (hand.length === 0) return { winner: playerId };
        }
        return null;
    }
    getSnapshot(requestingPlayerId: number) {
        const counts: Record<number, number> = {};
        for (const [id, hand] of this.playerHands) {
            counts[id] = hand.length;
        }
        return {
            topCard: this.topCard,
            currentPlayerId: this.playerIds[this.currentPlayerIndex],
            direction: this.direction,
            playerCardCounts: counts,
            myHand: this.playerHands.get(requestingPlayerId) ?? [],
        };
    }
}