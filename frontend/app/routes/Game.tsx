import { useState, useEffect } from 'react';
import { useLocation, useBlocker } from 'react-router';
import { MOCK_HAND, MOCK_TOP_CARD, MOCK_OPPONENTS } from '~/mockData';
import SSSCard from '~/components/SSSCard';
import { sounds } from '~/sounds';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase     = 'closing' | 'closed' | 'opening' | 'done';
type Turn      = 'player' | 'top' | 'left' | 'right';
type CardColor = 'crimson' | 'yellow' | 'orange' | 'purple';

interface Card          { color: string; value: string }
interface LocationState { fromRoom?: boolean }

// ─── Constants ────────────────────────────────────────────────────────────────

const WILD_GLOW_COLORS: Record<CardColor, string> = {
  crimson: '#9B0000',
  purple:  '#9f00f5',
  yellow:  '#F5A800',
  orange:  '#F56200',
};

// Positions match the wild card quadrants: tl=crimson, tr=purple, bl=yellow, br=orange
const COLOR_OPTIONS: { color: CardColor; hex: string; label: string; pos: 'tl' | 'tr' | 'bl' | 'br' }[] = [
  { color: 'crimson', hex: '#9B0000', label: 'Crimson', pos: 'tl' },
  { color: 'purple',  hex: '#9f00f5', label: 'Purple',  pos: 'tr' },
  { color: 'yellow',  hex: '#F5A800', label: 'Yellow',  pos: 'bl' },
  { color: 'orange',  hex: '#F56200', label: 'Orange',  pos: 'br' },
];

const cardId = ({ color, value }: Card) =>
  color === 'wild' ? value : `${color}_${value}`;

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({ onPick }: { onPick: (c: CardColor) => void }) {
  const [closing, setClosing] = useState(false);

  const handlePick = (color: CardColor) => {
    sounds.click();
    setClosing(true);
    setTimeout(() => onPick(color), 280);
  };

  return (
    <div className={`color-picker-backdrop${closing ? ' color-picker-backdrop--closing' : ''}`}>
      <p className="color-picker__title">Choose a color</p>
      <div className="color-picker">
        {COLOR_OPTIONS.map(({ color, hex, label, pos }) => (
          <button
            key={color}
            className={`color-picker__btn color-picker__btn--${pos}`}
            style={{ '--clr': hex } as React.CSSProperties}
            onClick={() => handlePick(color)}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Opponent Hand ─────────────────────────────────────────────────────────────

// HONIKE: replace `count` with the real card count from:
//   game:state   → snapshot.opponents[position].cardCount   (initial)
//   game:draw    → update the matching opponent's count      (on draw)
//   game:cardPlayed → decrement matching opponent's count    (on play)
function OpponentHand({ position, count = 6 }: { position: 'top' | 'left' | 'right'; count?: number }) {
  return (
    <div className={`opponent-hand opponent-hand--${position}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="opponent-card"
          style={{ marginLeft: i === 0 ? 0 : -30, animationDelay: `${i * 90}ms` }}
        >
          <SSSCard id="back" height={110} />
        </div>
      ))}
    </div>
  );
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export default function Game() {
  const location = useLocation();
  const fromRoom = (location.state as LocationState)?.fromRoom === true;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<Phase>(fromRoom ? 'closed' : 'closing');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dealtCards, setDealtCards]     = useState<Set<number>>(new Set());
  const [handHovered, setHandHovered]   = useState(false);

  // ── Game state (sourced from socket once wired) ────────────────────────────
  // HONIKE: all of these should be set inside socket.on('game:state', (snapshot) => { ... })
  //   snapshot shape (expected from Xonex's GameStateSnapshot type):
  //     snapshot.yourHand      → Card[]          → setHand
  //     snapshot.topCard       → Card            → setTopCard
  //     snapshot.currentTurn   → Turn            → setCurrentTurn
  //     snapshot.opponents     → { top, left, right }: { nickname, cardCount }
  const [hand, setHand]                           = useState(MOCK_HAND);
  const [topCard, setTopCard]                     = useState(MOCK_TOP_CARD);
  const [currentTurn, setCurrentTurn]             = useState<Turn>('player');
  const [showColorPicker, setShowColorPicker]     = useState(false);
  const [activeWildColor, setActiveWildColor]     = useState<CardColor | null>(null);
  const [soloCalled, setSoloCalled]               = useState(false);
  const [showSoloSplash, setShowSoloSplash]       = useState(false);
  const [soloEffects, setSoloEffects]             = useState(false);

  // Block in-app navigation while the game is live
  useBlocker(() => phase === 'done');

  // Block reload / tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ── Curtain sequence ──────────────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'closed') sounds.start();
  }, [phase]);

  useEffect(() => {
    if (fromRoom) {
      const t1 = setTimeout(() => setPhase('opening'), 900);
      const t2 = setTimeout(() => setPhase('done'),    1650);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    const t1 = setTimeout(() => setPhase('closed'),  700);
    const t2 = setTimeout(() => setPhase('opening'), 1700);
    const t3 = setTimeout(() => setPhase('done'),    2450);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ── Card actions ──────────────────────────────────────────────────────────

  const handleCardClick = (card: Card, index: number) => {
    setHand(prev => prev.filter((_, i) => i !== index));
    setTopCard(card);
    setActiveWildColor(null);
    if (card.color === 'wild') setShowColorPicker(true);
    // HONIKE: socket.emit('game:playCard', { card })
    //         server validates legality, then broadcasts:
    //           'game:cardPlayed' → { playerId, card }  to all players
    //           'game:turn'       → { turn: Turn }      to all players
  };

  const handleColorPick = (color: CardColor) => {
    setShowColorPicker(false);
    setActiveWildColor(color);
    // HONIKE: socket.emit('game:colorSelected', { color })
    //         server broadcasts 'game:colorSelected' → { color } to all players
  };

  // ── SOLO ──────────────────────────────────────────────────────────────────

  const triggerSolo = () => {
    sounds.solo();
    setShowSoloSplash(true);
    setSoloEffects(true);
    setTimeout(() => setShowSoloSplash(false), 1800);
    setTimeout(() => setSoloEffects(false),    2200);
  };

  const handleSolo = () => {
    if (soloCalled) return;
    setSoloCalled(true);
    triggerSolo();
    // HONIKE: socket.emit('game:solo')
    //         server broadcasts 'game:solo' → { playerId } to all players in the room
    //         replace the localStorage block below with: socket.on('game:solo', () => triggerSolo())
    // MOCK: localStorage broadcast (remove when sockets are wired)
    const key = 'sss:solo';
    localStorage.setItem(key, Date.now().toString());
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: Date.now().toString() }));
  };

  // HONIKE: remove this effect and replace with socket.on('game:solo', () => triggerSolo())
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'sss:solo') triggerSolo();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    if (hand.length !== 1) setSoloCalled(false);
  }, [hand.length]);

  const onDealEnd = (i: number) =>
    setDealtCards(prev => new Set([...prev, i]));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="game">
      <img className="game-bg" src="/table.jpg" draggable={false} />

      {/* Curtain intro */}
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
        <>
          {/* Deck + discard pile */}
          <div className="game-deck">
            <SSSCard id="back" height={110} />
          </div>
          <div
            className="game-top-card"
            style={activeWildColor ? { '--wild-glow': WILD_GLOW_COLORS[activeWildColor] } as React.CSSProperties : undefined}
            data-wild-active={activeWildColor ?? undefined}
          >
            <SSSCard id={cardId(topCard)} height={110} />
          </div>

          {/* Opponent names — HONIKE: replace MOCK_OPPONENTS with snapshot.opponents[pos].nickname */}
          <div className="opponent-name opponent-name--top">{MOCK_OPPONENTS.top}</div>
          <div className="opponent-name opponent-name--left">{MOCK_OPPONENTS.left}</div>
          <div className="opponent-name opponent-name--right">{MOCK_OPPONENTS.right}</div>

          {/* Opponent hands — HONIKE: pass count={snapshot.opponents[pos].cardCount} */}
          <OpponentHand position="top" />
          <OpponentHand position="left" />
          <OpponentHand position="right" />

          {/* Player's hand */}
          <div
            className="game-hand"
            onMouseEnter={() => setHandHovered(true)}
            onMouseLeave={() => { setHandHovered(false); setHoveredIndex(null); }}
          >
            {hand.map((card, i) => {
              const isDealing = !dealtCards.has(i);
              return (
                // Static wrapper holds events + margin — never transforms, so hover never flickers
                <div
                  key={i}
                  className="game-card-hit"
                  style={{
                    marginLeft: i === 0 ? 0 : handHovered ? 3 : -30,
                    zIndex:     hoveredIndex === i ? 99 : i,
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleCardClick(card, i)}
                >
                  <div
                    className={[
                      'game-card',
                      hoveredIndex === i ? 'game-card--hovered' : '',
                      isDealing          ? 'game-card--dealing'  : '',
                    ].join(' ')}
                    style={{ animationDelay: isDealing ? `${i * 90}ms` : '0ms' }}
                    onAnimationEnd={() => onDealEnd(i)}
                  >
                    <SSSCard id={cardId(card)} height={110} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* SOLO button — appears when 1 card left */}
          {hand.length === 1 && (
            <button
              className={`solo-btn${soloCalled ? ' solo-btn--called' : ''}`}
              onClick={handleSolo}
            >
              SOLO
            </button>
          )}
        </>
      )}

      {/* SOLO effects */}
      {soloEffects && (
        <div className="solo-effects" aria-hidden>
          <div className="solo-flash" />
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="solo-particle"
              style={{
                '--angle': `${(i / 30) * 360 + Math.random() * 20}deg`,
                '--dist':  `${180 + Math.random() * 220}px`,
                '--size':  `${6 + Math.random() * 10}px`,
                '--delay': `${Math.random() * 120}ms`,
                '--clr':   ['#9f00f5','#fff','#f5a800','#e040fb','#ffffff','#c77dff'][i % 6],
                '--rot':   `${Math.random() * 360}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {showSoloSplash && (
        <img src="/solo.svg" className="solo-splash" draggable={false} />
      )}

      {showColorPicker && <ColorPicker onPick={handleColorPick} />}
    </div>
  );
}
