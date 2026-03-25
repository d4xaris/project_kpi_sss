export class Deck {}
type CardColor = 'crimson' | 'yellow' | 'orange' | 'purple' | 'Black'; //массив цветов
type CardValue = |'0'| '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'Skip' | 'Reverse' | 'Draw+2' | 'black-change' | 'black+4-change'; //массив действий кард
interface Card{
    color: CardColor;
    value: CardValue;
}// интерфейс карт
class Decka {
    private cards: Card[] = [];

    constructor() {
        const colors: CardColor[] = ['crimson', 'yellow', 'orange', 'purple'];
        const Black = 'Black';
        const values: CardValue[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw+2'];
        const zero = '0'; // нулей только 4
        const blackChange = 'black-change';
        const blackPlusFourChange = 'black+4-change';
        for (let i = 0; i < 4; i++) {
            this.cards.push( {
                color: 'Black',
                value: 'black+4-change',
            }); // генерация 4 черных карт первого вида
        }
        for (let i = 0; i < 4; i++) {
            this.cards.push({
                color: 'Black',
                value: 'black-change',
            }); // генерация 4 черных карт второго вида
        }
        for (const color of colors) {
            this.cards.push({
                color: color,
                value: zero,
            });// генерация нулей
            for (let i = 0; i < 2; i++) {
                for (const value of values) {
                    this.cards.push({
                        color: color,
                        value: value,
                    }); // генерация всех карт

                }
            }
        }
    }
    public getCards() {
        return this.cards;
    }
    shuffle (){
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            const temp = this.cards[i] as Card;
            this.cards[i] = this.cards[j] as Card;
            this.cards[j] = temp;
        }

    } // тасование карт алгоритмом Фишера-Йетса

}

const myDeck = new Decka();
myDeck.shuffle();
console.table(myDeck.getCards());