export type Phase    = 'closing' | 'closed' | 'opening' | 'done';
export type Turn     = 'player' | 'top' | 'left' | 'right';
export type Slot     = 'top' | 'left' | 'right';

export interface Card     { color: string; value: string }
export interface HandCard extends Card { uid: string }

let _uid = 0;
export const mkUid  = () => String(_uid++);
export const cardId = ({ color, value }: Card) =>
  color === 'wild' ? value : `${color}_${value}`;
