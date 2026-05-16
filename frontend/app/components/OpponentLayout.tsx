import OpponentHand from '~/components/OpponentHand';

type Slot = 'top' | 'left' | 'right';

const SLOTS: Record<number, Slot[]> = {
  2: ['top'],
  3: ['top', 'right'],
  4: ['top', 'left', 'right'],
};

interface OpponentLayoutProps {
  playerCount: number;
  opponents:   Partial<Record<Slot, string>>;
  cardCounts?: Partial<Record<Slot, number>>;
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
