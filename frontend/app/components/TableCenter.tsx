import SSSCard from '~/components/SSSCard';
import { cardId } from '~/types/game';
import type { Card, Turn } from '~/types/game';
import type { CardColor } from '~/components/ColorPicker';

const WILD_GLOW_COLORS: Record<CardColor, string> = {
  crimson: '#9B0000',
  purple:  '#9f00f5',
  yellow:  '#F5A800',
  orange:  '#F56200',
};

type Props = {
  topCard:         Card;
  activeWildColor: CardColor | null;
  currentTurn:     Turn;
  hasPlayableCard: boolean;
  onDeckClick:     () => void;
};

export { WILD_GLOW_COLORS };

export default function TableCenter({ topCard, activeWildColor, currentTurn, hasPlayableCard, onDeckClick }: Props) {
  return (
    <>
      <div
        className={`game-deck${currentTurn === 'player' && !hasPlayableCard ? ' game-deck--active' : ''}`}
        onClick={onDeckClick}
      >
        <SSSCard id="back" height={110} />
      </div>

      <div
        className="game-top-card"
        style={activeWildColor ? { '--wild-glow': WILD_GLOW_COLORS[activeWildColor] } as React.CSSProperties : undefined}
        data-wild-active={activeWildColor ?? undefined}
      >
        <SSSCard id={cardId(topCard)} height={110} />
      </div>

      {activeWildColor && (
        <div
          className="wild-color-label"
          style={{ background: WILD_GLOW_COLORS[activeWildColor] }}
        >
          {activeWildColor.charAt(0).toUpperCase() + activeWildColor.slice(1)}
        </div>
      )}
    </>
  );
}
