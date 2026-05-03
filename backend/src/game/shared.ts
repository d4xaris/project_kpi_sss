export type CardColor = 'crimson' | 'yellow' | 'orange' | 'purple' | 'wild'; //массив цветов
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'drawtwo' | 'wild' | 'wild_draw4';
export interface Card {
    color: CardColor;
    value: CardValue;
}
