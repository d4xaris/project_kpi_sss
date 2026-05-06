export type CardColor = 'crimson' | 'yellow' | 'orange' | 'purple' | 'wild'; //массив цветов
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'drawtwo' | 'wild' | 'wild_draw4';
export interface Card {
    color: CardColor;
    value: CardValue;
}
export type ActionResult =
    | { success: true }
    | { success: false, reason: 'NOT_YOUR_TURN' | 'INVALID_CARD' | 'CARD_NOT_IN_HAND' | 'GAME_OVER' };

export class GameStateSnapshot {
    topCards: Card[] = [];
    myHand : Card[] = [];
    currentPlayerId: number = 0;
    //playerCardCount (type Record number)
    direction= 1|-1;

}