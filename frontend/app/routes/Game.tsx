import { useState, useEffect, useRef } from 'react';
import { useLocation, useBlocker, useNavigate } from 'react-router';
import { MOCK_HAND, MOCK_TOP_CARD, MOCK_OPPONENTS } from '~/mockData';
import SSSCard from '~/components/SSSCard';
import { sounds } from '~/sounds';
import { useAuth } from '~/hooks/useAuth';
import ColorPicker, { type CardColor } from '~/components/ColorPicker';
import OpponentLayout from '~/components/OpponentLayout';
import WinScreen from '~/components/WinScreen';
import SoloEffects from '~/components/SoloEffects';
import { useSolo } from '~/hooks/useSolo';

type Phase = 'closing' | 'closed' | 'opening' | 'done';
type Turn  = 'player' | 'top' | 'left' | 'right';

interface Card          { color: string; value: string }
interface LocationState { fromRoom?: boolean; playerCount?: number }

// ─── Constants ────────────────────────────────────────────────────────────────

// Opponents visited per turn, in order, for each direction.
// Layout positions on screen: left=west, top=north, right=east, player=south.
// Clockwise  (dir= 1): south → west → north → east  →  player → left → top → right
// Counter    (dir=-1): south → east → north → west  →  player → right → top → left
const OPPONENT_ORDER: Record<number, Record<1 | -1, Array<'top' | 'left' | 'right'>>> = {
  2: { 1: ['top'],              [-1]: ['top']              },
  3: { 1: ['top', 'right'],     [-1]: ['right', 'top']     },
  4: { 1: ['left', 'top', 'right'], [-1]: ['right', 'top', 'left'] },
};

const WILD_GLOW_COLORS: Record<CardColor, string> = {
  crimson: '#9B0000',
  purple:  '#9f00f5',
  yellow:  '#F5A800',
  orange:  '#F56200',
};

const cardId = ({ color, value }: Card) =>
  color === 'wild' ? value : `${color}_${value}`;

// Generates a random coloured number card for draw effects
const DRAW_COLORS = ['crimson', 'purple', 'yellow', 'orange'] as const;
const DRAW_VALS   = ['1','2','3','4','5','6','7','8','9'] as const;
const randomCard  = (): Card => ({
  color: DRAW_COLORS[Math.floor(Math.random() * DRAW_COLORS.length)],
  value: DRAW_VALS  [Math.floor(Math.random() * DRAW_VALS.length)],
});

// ─── Game ─────────────────────────────────────────────────────────────────────

export default function Game() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const fromRoom    = (location.state as LocationState)?.fromRoom === true;
  const playerCount = (location.state as LocationState)?.playerCount ?? 4;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<Phase>(fromRoom ? 'closed' : 'closing');
  const [winner, setWinner]             = useState<string | null>(null);
  const [winExiting, setWinExiting]     = useState(false);
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
  const [hand, setHand]                       = useState(MOCK_HAND);
  const [topCard, setTopCard]                 = useState(MOCK_TOP_CARD);
  const [currentTurn, setCurrentTurn]         = useState<Turn>('player');
  const [direction, setDirection]             = useState<1 | -1>(1);   // 1=clockwise, -1=counter
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeWildColor, setActiveWildColor] = useState<CardColor | null>(null);
  // Per-opponent card counts (HONIKE: replace with snapshot.opponents[pos].cardCount)
  const [oppCounts, setOppCounts] = useState({ top: 6, left: 6, right: 6 });

  // ── Catch mechanic ───────────────────────────────────────────────────────
  const [catchTarget, setCatchTarget] = useState<'top' | 'left' | 'right' | null>(null);

  // Tracks all mock-turn timeouts so we can cancel them if needed
  const turnTimers       = useRef<ReturnType<typeof setTimeout>[]>([]);
  const catchTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOppCountsRef = useRef({ top: 6, left: 6, right: 6 });

  // Cycles through plausible mock cards for the opponents to "play"
  // HONIKE: remove — the actual card comes from socket 'game:cardPlayed' event
  const MOCK_OPP_CARDS = [
    { color: 'purple',  value: '7'       },
    { color: 'orange',  value: 'skip'    },
    { color: 'crimson', value: '3'       },
    { color: 'yellow',  value: '5'       },
    { color: 'purple',  value: 'reverse' },
    { color: 'orange',  value: '9'       },
    { color: 'crimson', value: 'drawtwo' },
  ] as const;
  const mockOppIdx = useRef(0);

  const { soloCalled, showSoloSplash, soloEffects, handleSolo } = useSolo(hand.length);

  // Block in-app navigation while the game is live (allow once winner shown)
  useBlocker(() => phase === 'done' && winner === null);

  // Block reload / tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Cancel any pending turn/catch timers on unmount
  useEffect(() => () => {
    turnTimers.current.forEach(clearTimeout);
    if (catchTimerRef.current) clearTimeout(catchTimerRef.current);
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
    if (currentTurn !== 'player') return; // block plays out of turn

    setHand(prev => prev.filter((_, i) => i !== index));
    setTopCard(card);
    setActiveWildColor(null);
    if (card.color === 'wild') setShowColorPicker(true);

    // MOCK: schedule each opponent's turn with flying-card + count decrement.
    // HONIKE: delete this entire block — replace with:
    //   socket.on('game:turn',       ({ turn })         => setCurrentTurn(turn))
    //   socket.on('game:cardPlayed', ({ slot, card })   => {
    //     setFlyingCard(slot);
    //     setOppCounts(prev => ({ ...prev, [slot]: prev[slot] - 1 }));
    //     setTimeout(() => { setFlyingCard(null); setTopCard(card); }, 550);
    //   })
    turnTimers.current.forEach(clearTimeout);
    turnTimers.current = [];

    const nextDir: 1 | -1 = card.value === 'reverse' ? (direction * -1) as 1 | -1 : direction;
    if (card.value === 'reverse') setDirection(nextDir);

    const isDrawCard = card.value === 'drawtwo' || card.value === 'wild_draw4';
    const drawAmount = card.value === 'drawtwo' ? 2 : card.value === 'wild_draw4' ? 4 : 0;

    const opponents  = (OPPONENT_ORDER[playerCount] ?? OPPONENT_ORDER[4])[nextDir];
    let toVisit      = card.value === 'skip' ? opponents.slice(1) : opponents;

    // Draw cards: first opponent receives +N cards and their play turn is skipped
    let drawTarget: (typeof toVisit)[number] | null = null;
    if (isDrawCard && toVisit.length > 0) {
      drawTarget = toVisit[0];
      toVisit    = toVisit.slice(1);
    }

    // Each opponent turn takes 1 800 ms:
    //   0 ms    → fan out (setCurrentTurn)
    //   1 000 ms → card disappears from hand + top card updates (same as player play)
    //   1 800 ms → next opponent / player
    const TURN_MS  = 1800;
    const PLAY_MS  = 1000;

    let base = 0;

    // If the player played a draw card, show that opponent's turn first,
    // give them the extra cards, then skip to the remaining opponents.
    if (drawTarget) {
      const dt = drawTarget;
      turnTimers.current.push(setTimeout(() => setCurrentTurn(dt), base));
      turnTimers.current.push(setTimeout(() => {
        setOppCounts(prev => ({ ...prev, [dt]: prev[dt] + drawAmount }));
      }, base + PLAY_MS));
      base += TURN_MS;
    }

    toVisit.forEach(slot => {
      turnTimers.current.push(setTimeout(() => setCurrentTurn(slot), base));

      turnTimers.current.push(setTimeout(() => {
        // First card vanishes from their hand (count - 1)
        setOppCounts(prev => ({ ...prev, [slot]: Math.max(0, prev[slot] - 1) }));
        // Top card updates instantly, same as when the player plays
        const played = MOCK_OPP_CARDS[mockOppIdx.current % MOCK_OPP_CARDS.length];
        mockOppIdx.current += 1;
        setTopCard(played as Card);
        // If the mock opponent played a reverse, flip the direction for all subsequent turns
        // HONIKE: remove — server will handle this and broadcast the new turn order
        if (played.value === 'reverse') setDirection(d => (d * -1) as 1 | -1);
        // If the mock opponent played drawtwo, deal +2 cards to the player
        // HONIKE: remove — server broadcasts 'game:draw' → { target: 'you', count: 2 }
        if (played.value === 'drawtwo') {
          setHand(prev => [...prev, randomCard(), randomCard()]);
        }
      }, base + PLAY_MS));

      base += TURN_MS;
    });

    turnTimers.current.push(setTimeout(() => setCurrentTurn('player'), base));

    // HONIKE: socket.emit('game:playCard', { card })
    //         server validates legality, then broadcasts game:cardPlayed + game:turn
  };

  const handleColorPick = (color: CardColor) => {
    setShowColorPicker(false);
    setActiveWildColor(color);
    // HONIKE: socket.emit('game:colorSelected', { color })
    //         server broadcasts 'game:colorSelected' → { color } to all players
  };

  // ── Win trigger ───────────────────────────────────────────────────────────
  // HONIKE: replace hand.length === 0 with socket.on('game:winner', ({ nickname }) => setWinner(nickname))
  useEffect(() => {
    if (hand.length === 0 && phase === 'done') {
      const nick = user?.nickname ?? 'You';
      // small delay so the last card's play animation finishes first
      setTimeout(() => setWinner(nick), 500);
    }
  }, [hand.length, phase]);

  // ── Catch-window: open 3-second window when an opponent drops to 1 card ──
  useEffect(() => {
    const prev = prevOppCountsRef.current;
    ((['top', 'left', 'right'] as const)).forEach(slot => {
      if (prev[slot] > 1 && oppCounts[slot] === 1) {
        if (catchTimerRef.current) clearTimeout(catchTimerRef.current);
        setCatchTarget(slot);
        catchTimerRef.current = setTimeout(() => setCatchTarget(null), 3000);
      }
    });
    prevOppCountsRef.current = { ...oppCounts };
  }, [oppCounts]);

  const handleCatch = (slot: 'top' | 'left' | 'right') => {
    if (catchTimerRef.current) clearTimeout(catchTimerRef.current);
    setCatchTarget(null);
    // Penalty: +2 cards to the opponent who didn't call SOLO
    setOppCounts(prev => ({ ...prev, [slot]: prev[slot] + 2 }));
    // HONIKE: socket.emit('game:catch', { slot }) → server adds +2 to that player
  };

  const handleGoHome = () => {
    setWinExiting(true);           // triggers curtain close
    setTimeout(() => navigate('/'), 750); // navigate after curtain fully closed
  };

  const onDealEnd = (i: number) =>
    setDealtCards(prev => new Set([...prev, i]));

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

          {/* Opponents — layout adapts to 2 / 3 / 4 players automatically */}
          {/* HONIKE: cardCounts → snapshot.opponents[pos].cardCount */}
          <OpponentLayout
            playerCount={playerCount}
            opponents={MOCK_OPPONENTS}
            cardCounts={oppCounts}
            activeTurn={currentTurn}
          />

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

          {/* CATCH button — appears for 3 s when an opponent drops to 1 card */}
          {/* HONIKE: replace catchTarget with a socket event 'game:solo' → { slot } */}
          {catchTarget && (
            <button
              className={`catch-btn catch-btn--${catchTarget}`}
              onClick={() => handleCatch(catchTarget)}
            >
              CATCH!
            </button>
          )}
        </>
      )}

      {/* SOLO effects */}
      <SoloEffects showEffects={soloEffects} showSplash={showSoloSplash} />

      {showColorPicker && <ColorPicker onPick={handleColorPick} />}

      {/* ── Win screen overlay ── */}
      {winner !== null && (
        <WinScreen nickname={winner} onHome={handleGoHome} exiting={winExiting} />
      )}

      {/* ── Exit curtain — slides in over everything when going home ── */}
      {winExiting && (
        <div className="curtain">
          <div className="curtain__left  curtain__left--closing" />
          <div className="curtain__right curtain__right--closing" />
        </div>
      )}
    </div>
  );
}
