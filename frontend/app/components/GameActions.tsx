import { useState, useEffect, useRef } from 'react';
import type { Slot } from '~/types/game';

type Corner = { top?: string; bottom?: string; left?: string; right?: string };

const CORNERS: Corner[] = [
  { top: '30px',    left:  '36px'  },
  { top: '30px',    right: '36px'  },
  { bottom: '30px', left:  '36px'  },
  { bottom: '30px', right: '36px'  },
];

function randomCorner(exclude?: Corner): Corner {
  const choices = exclude
    ? CORNERS.filter(c => JSON.stringify(c) !== JSON.stringify(exclude))
    : CORNERS;
  return choices[Math.floor(Math.random() * choices.length)]!;
}

type Props = {
  catchTarget:  Slot | null;
  showSolo:     boolean;
  soloCalled:   boolean;
  catchLocked?: boolean;
  onSolo:       () => void;
  onCatch:      (slot: Slot) => void;
};

export default function GameActions(
  { catchTarget, showSolo, soloCalled, catchLocked, onSolo, onCatch }: Props
) {
  const [corner, setCorner] = useState<Corner>(() => randomCorner());
  const prevCornerRef = useRef<Corner>(corner);

  // Each time the CATCH button appears (catchTarget goes null -> non-null),
  // pick a new corner different from the last one shown.
  useEffect(() => {
    if (catchTarget) {
      const next = randomCorner(prevCornerRef.current);
      prevCornerRef.current = next;
      setCorner(next);
    }
  }, [catchTarget]);

  if (!showSolo && !catchTarget) return null;

  return (
    <>
      {catchTarget && (
        <button
          className={`catch-btn${catchLocked ? ' catch-btn--locked' : ''}`}
          style={{ position: 'fixed', zIndex: 100, ...corner }}
          onClick={() => !catchLocked && onCatch(catchTarget)}
          disabled={catchLocked}
        >
          CATCH!
        </button>
      )}

      {showSolo && (
        <div className="game-actions">
          <button
            className={`solo-btn${soloCalled ? ' solo-btn--called' : ''}`}
            onClick={onSolo}
          >
            SOLO
          </button>
        </div>
      )}
    </>
  );
}
