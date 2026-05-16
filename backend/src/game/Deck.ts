import {type CardColor, type CardValue } from './shared.js';
//массив карт
interface Card{
    color: CardColor;
    value: CardValue;
}// интерфейс карт
export class Deck {
    private cards: Card[] = [];

    constructor() {
        const colors: CardColor[] = ['crimson', 'yellow', 'orange', 'purple'];
        const values: CardValue[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'drawtwo'];
        const zero: CardValue = '0'; // нулей только 4
        this.cards.push({ color: 'wild', value: 'troll' });

        for (let i = 0; i < 4; i++) {
            this.cards.push({ color: 'wild', value: 'wild_draw4' }); // генерация 4 черных карт первого вида
        }
        for (let i = 0; i < 4; i++) {
            this.cards.push({ color: 'wild', value: 'wild' }); // генерация 4 черных карт второго вида
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
                    }); // генерация всех ост карт
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
    draw(count: number) {
        const actualCount = Math.min(count, this.cards.length);
        if (count <= 0) {
            return [];
        }
        return this.cards.splice(0, actualCount);
    }
}
//const myDeck = new Deck();
//myDeck.shuffle();
// const discard = myDeck.getCards().splice(0, 100);
// const drawCards = myDeck.draw(5);
// console.table(discard);
// console.log(myDeck);
// console.log(drawCards);