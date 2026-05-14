import OpponentHand from '~/components/OpponentHand';

type Slot = 'top' | 'left' | 'right';

// Which slots are active per player count
//   2 players → you + 1 opponent:   top
//   3 players → you + 2 opponents:  top, right
//   4 players → you + 3 opponents:  top, left, right
const SLOTS: Record<number, Slot[]> = {
  2: ['top'],
  3: ['top', 'right'],
  4: ['top', 'left', 'right'],
};

interface OpponentLayoutProps {
  playerCount: number;
  /** Display name per slot */
  opponents:   Partial<Record<Slot, string>>;
  /** Card count per slot — HONIKE: pass snapshot.opponents[pos].cardCount */
  cardCounts?: Partial<Record<Slot, number>>;
  /** Which slot is currently taking their turn — cards fan out on that slot */
  activeTurn?: Slot | 'player';
}

export default function OpponentLayout({
  playerCount,
  opponents,
  cardCounts = {},
  activeTurn,
}: OpponentLayoutProps) {
  const slots = SLOTS[playerCount] ?? SLOTS[4];

  return (
    <>
      {slots.map(pos => (
        <span key={pos}>
          <OpponentHand
            position={pos}
            count={cardCounts[pos]}
            isActive={activeTurn === pos}
          />
          <div className={`opponent-name opponent-name--${pos}`}>
            {opponents[pos] ?? '?'}
          </div>
        </span>
      ))}
    </>
  );
}
