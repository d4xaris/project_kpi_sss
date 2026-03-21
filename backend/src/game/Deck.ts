export class Deck {}
type CardColor = 'Red' | 'Green' | 'Blue' | 'Yellow' | 'Black';
type CardValue = |'0'| '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'Skip' | 'Reverse' | 'Draw+2' | 'black-change' | 'black+4-change';
interface Card{
    color: CardColor;
    value: CardValue;
}
class Decka {
    private cards: Card[] = [];
    constructor() {
        const colors: CardColor[] = ['Red', 'Green', 'Blue', 'Yellow'];
        const values: CardValue[] = ['0','1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw+2'];

    }
}