import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { MOCK_HAND } from '~/mockData';
import SSSCard from '~/components/SSSCard';
import { sounds } from '~/sounds';

function cardId(card: { color: string; value: string }): string {
  if (card.color === 'wild') return card.value;
  return `${card.color}_${card.value}`;
}

type Phase = 'closing' | 'closed' | 'opening' | 'done';


export default function Game() {
  const hand     = MOCK_HAND;
  const location = useLocation();
  const fromRoom = (location.state as any)?.fromRoom === true;

  const [phase, setPhase]               = useState<Phase>(fromRoom ? 'closed' : 'closing');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dealtCards, setDealtCards]     = useState<Set<number>>(new Set());
  const [handHovered, setHandHovered]   = useState(false);

  // Play start sound when logo appears
  useEffect(() => {
    if (phase === 'closed') sounds.start();
  }, [phase]);

  // Curtain sequence
  useEffect(() => {
    if (fromRoom) {
      const t1 = setTimeout(() => setPhase('opening'), 900);
      const t2 = setTimeout(() => setPhase('done'),    1650);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      const t1 = setTimeout(() => setPhase('closed'),  700);
      const t2 = setTimeout(() => setPhase('opening'), 1700);
      const t3 = setTimeout(() => setPhase('done'),    2450);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, []);

  const onDealEnd = (i: number) =>
    setDealtCards(prev => new Set([...prev, i]));

  return (
    <div className="game">
      <img className="game-bg" src="/table.jpg" draggable={false} />

      {phase !== 'done' && (
        <div className="curtain">
          <div className={`curtain__left  curtain__left--${phase}`}  />
          <div className={`curtain__right curtain__right--${phase}`} />

          <img
            src="/project_sss.png"
            className={`curtain__logo${phase === 'closed' ? ' curtain__logo--visible' : phase === 'opening' ? ' curtain__logo--hiding' : ''}`}
            draggable={false}
          />
        </div>
      )}

      {phase === 'done' && (
        <div
          className="game-hand"
          onMouseEnter={() => setHandHovered(true)}
          onMouseLeave={() => { setHandHovered(false); setHoveredIndex(null); }}
        >
          {hand.map((card, i) => {
            const isDealing = !dealtCards.has(i);
            return (
              <div
                key={i}
                className={[
                  'game-card',
                  hoveredIndex === i ? 'game-card--hovered' : '',
                  isDealing          ? 'game-card--dealing'  : '',
                ].join(' ')}
                style={{
                  marginLeft:     i === 0 ? 0 : handHovered ? 3 : -30,
                  zIndex:         hoveredIndex === i ? 99 : i,
                  animationDelay: isDealing ? `${i * 90}ms` : '0ms',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onAnimationEnd={() => onDealEnd(i)}
              >
                <SSSCard id={cardId(card)} height={130} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
