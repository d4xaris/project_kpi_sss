import SSSCard from '~/components/SSSCard';

interface FlyingCardProps {
  slot: 'top' | 'left' | 'right';
}

export default function FlyingCard({ slot }: FlyingCardProps) {
  return (
    <div className={`flying-card flying-card--${slot}`} aria-hidden>
      <SSSCard id="back" height={110} />
    </div>
  );
}
