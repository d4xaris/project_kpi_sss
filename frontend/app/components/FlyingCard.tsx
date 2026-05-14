import SSSCard from '~/components/SSSCard';

interface FlyingCardProps {
  /** Which opponent slot is throwing the card */
  slot: 'top' | 'left' | 'right';
}

/**
 * A back-card that flies from the opponent's position to the centre discard pile.
 * Rendered at the discard-pile coordinates (top:47%, left:50%) and animated
 * FROM an offset matching the opponent's screen position.
 *
 * HONIKE: when sockets are wired you can swap `id="back"` for the actual
 *         played card once the server broadcasts `game:cardPlayed → { card }`.
 */
export default function FlyingCard({ slot }: FlyingCardProps) {
  return (
    <div className={`flying-card flying-card--${slot}`} aria-hidden>
      <SSSCard id="back" height={110} />
    </div>
  );
}
