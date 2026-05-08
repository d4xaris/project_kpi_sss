import {type Card} from "./shared.js";
export function canPlayCards (topCard: Card, hand: Card): boolean {
    if (hand.color === topCard.color){
        return true;
    }
    if(hand.color === "wild"){
        return true;
    }
    if(hand.value ===topCard.value){
        return true;
    }
    return false;
}