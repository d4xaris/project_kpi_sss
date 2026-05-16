import { useState } from 'react';
import SSSCard from '~/components/SSSCard';
import { cardId } from '~/types/game';
import type { Card, HandCard } from '~/types/game';

type Props = {
  hand:        HandCard[];
  onCardClick: (card: Card, index: number) => void;
};

export default function PlayerHand({ hand, onCardClick }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dealtCards,   setDealtCards]   = useState<Set<string>>(new Set());
  const [handHovered,  setHandHovered]  = useState(false);

  const onDealEnd = (uid: string) =>
    setDealtCards(prev => new Set([...prev, uid]));

  return (
    <div
      className="game-hand"
      onMouseEnter={() => setHandHovered(true)}
      onMouseLeave={() => { setHandHovered(false); setHoveredIndex(null); }}
    >
      {hand.map((card, i) => {
        const isDealing = !dealtCards.has(card.uid);
        return (
          <div
            key={card.uid}
            className="game-card-hit"
            style={{
              marginLeft: i === 0 ? 0 : handHovered ? 3 : -30,
              zIndex:     hoveredIndex === i ? 99 : i,
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onCardClick(card, i)}
          >
            <div
              className={[
                'game-card',
                hoveredIndex === i ? 'game-card--hovered' : '',
                isDealing          ? 'game-card--dealing'  : '',
              ].join(' ')}
              style={{ animationDelay: isDealing ? `${i * 90}ms` : '0ms' }}
              onAnimationEnd={() => onDealEnd(card.uid)}
            >
              <SSSCard id={cardId(card)} height={110} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
