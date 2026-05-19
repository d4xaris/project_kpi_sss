import type { Slot } from '~/types/game';

type Props = {
  catchTarget: Slot | null;
  showSolo:    boolean;
  soloCalled:  boolean;
  onSolo:      () => void;
  onCatch:     (slot: Slot) => void;
};

export default function GameActions({ catchTarget, showSolo, soloCalled, onSolo, onCatch }: Props) {
  if (!showSolo && !catchTarget) return null;

  return (
    <div className="game-actions">
      {catchTarget && (
        <button className="catch-btn" onClick={() => onCatch(catchTarget)}>
          CATCH!
        </button>
      )}
      {showSolo && (
        <button
          className={`solo-btn${soloCalled ? ' solo-btn--called' : ''}`}
          onClick={onSolo}
        >
          SOLO
        </button>
      )}
    </div>
  );
}
