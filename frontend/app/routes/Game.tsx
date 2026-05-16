import { useState, useEffect, useRef } from 'react';
import { useLocation, useBlocker, useNavigate } from 'react-router';
import { MOCK_HAND, MOCK_TOP_CARD } from '~/mockData';
import { sounds } from '~/sounds';
import { useAuth, apiFetch } from '~/hooks/useAuth';
import ColorPicker, { type CardColor } from '~/components/ColorPicker';
import OpponentLayout from '~/components/OpponentLayout';
import WinScreen from '~/components/WinScreen';
import SoloEffects from '~/components/SoloEffects';
import CatchEffect from '~/components/CatchEffect';
import FlyingCard from '~/components/FlyingCard';
import GameCurtain from '~/components/GameCurtain';
import TableCenter from '~/components/TableCenter';
import PlayerHand from '~/components/PlayerHand';
import GameActions from '~/components/GameActions';
import { useSolo } from '~/hooks/useSolo';
import { useCatch } from '~/hooks/useCatch';
import { mkUid } from '~/types/game';
import type { Phase, Turn, Slot, Card, HandCard } from '~/types/game';

const OPPONENT_ORDER: Record<number, Record<1 | -1, Slot[]>> = {
  2: { 1: ['top'],                  [-1]: ['top']                  },
  3: { 1: ['top', 'right'],         [-1]: ['right', 'top']         },
  4: { 1: ['left', 'top', 'right'], [-1]: ['right', 'top', 'left'] },
};

const DRAW_COLORS = ['crimson', 'purple', 'yellow', 'orange'] as const;
const DRAW_VALS   = ['1','2','3','4','5','6','7','8','9'] as const;
const randomCard  = (): HandCard => ({
  color: DRAW_COLORS[Math.floor(Math.random() * DRAW_COLORS.length)],
  value: DRAW_VALS  [Math.floor(Math.random() * DRAW_VALS.length)],
  uid:   mkUid(),
});

const isPlayable = (card: Card, top: Card, wildColor: CardColor | null): boolean => {
  if (card.color === 'wild') return true;
  if (wildColor)             return card.color === wildColor;
  return card.color === top.color || card.value === top.value;
};

interface LocationState { fromRoom?: boolean; playerCount?: number; sessionId?: number }

// Game

export default function Game() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const fromRoom    = (location.state as LocationState)?.fromRoom    === true;
  const playerCount = (location.state as LocationState)?.playerCount ?? 4;
  const sessionId   = (location.state as LocationState)?.sessionId  ?? null;

// State
  const [phase,           setPhase]           = useState<Phase>(fromRoom ? 'closed' : 'closing');
  const [winner,          setWinner]          = useState<string | null>(null);
  const [winExiting,      setWinExiting]      = useState(false);
  const [hand,            setHand]            = useState<HandCard[]>(() => MOCK_HAND.map(c => ({ ...c, uid: mkUid() })));
  const [topCard,         setTopCard]         = useState(MOCK_TOP_CARD);
  const [currentTurn,     setCurrentTurn]     = useState<Turn>('player');
  const [direction,       setDirection]       = useState<1 | -1>(1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeWildColor, setActiveWildColor] = useState<CardColor | null>(null);
  const [oppCounts,       setOppCounts]       = useState({ top: 6, left: 6, right: 6 });
  const [opponentNames,   setOpponentNames]   = useState<Partial<Record<Slot, string>>>({});
  const [flyingCard,      setFlyingCard]      = useState<Slot | null>(null);

  const turnTimers      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pendingWildTurn = useRef<{ toVisit: Slot[]; drawTarget: Slot | null; drawAmount: number } | null>(null);

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
  const { catchTarget, showCatchEffect, handleCatch } = useCatch(
    oppCounts,
    (slot) => setOppCounts(prev => ({ ...prev, [slot]: prev[slot] + 2 })),
  );

  const hasPlayableCard = hand.some(c => isPlayable(c, topCard, activeWildColor));

// Effects 
  useBlocker(() => phase === 'done' && winner === null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => () => { turnTimers.current.forEach(clearTimeout); }, []);

  useEffect(() => { if (phase === 'closed') sounds.start(); }, [phase]);

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

  useEffect(() => {
    if (hand.length === 0 && phase === 'done') {
      const nick = user?.nickname ?? 'You';
      setTimeout(() => {
        setWinner(nick);
        if (sessionId && user?.id)
          apiFetch(`/game/${sessionId}/finish`, { method: 'POST', body: JSON.stringify({ winnerId: user.id }) }).catch(() => {});
      }, 500);
    }
  }, [hand.length, phase]);

// Handlers 
  const runTurnSequence = (toVisit: Slot[], drawTarget: Slot | null, drawAmount: number) => {
    const TURN_MS = 1800;
    const PLAY_MS = 1000;
    let base = 0;

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
        setOppCounts(prev => ({ ...prev, [slot]: Math.max(0, prev[slot] - 1) }));
        const played = MOCK_OPP_CARDS[mockOppIdx.current % MOCK_OPP_CARDS.length];
        mockOppIdx.current += 1;
        setTopCard(played as Card);
        setActiveWildColor(null);
        if (played.value === 'reverse') setDirection(d => (d * -1) as 1 | -1);
        if (played.value === 'drawtwo') setHand(prev => [...prev, randomCard(), randomCard()]);
      }, base + PLAY_MS));
      base += TURN_MS;
    });

    turnTimers.current.push(setTimeout(() => setCurrentTurn('player'), base));
  };

  const handleCardClick = (card: Card, index: number) => {
    if (currentTurn !== 'player') return;
    setHand(prev => prev.filter((_, i) => i !== index));
    setTopCard(card);
    setActiveWildColor(null);
    turnTimers.current.forEach(clearTimeout);
    turnTimers.current = [];

    const nextDir: 1 | -1  = card.value === 'reverse' ? (direction * -1) as 1 | -1 : direction;
    if (card.value === 'reverse') setDirection(nextDir);

    const isDrawCard = card.value === 'drawtwo' || card.value === 'wild_draw4';
    const drawAmount = card.value === 'drawtwo' ? 2 : card.value === 'wild_draw4' ? 4 : 0;
    const opponents  = (OPPONENT_ORDER[playerCount] ?? OPPONENT_ORDER[4])[nextDir];
    let toVisit      = card.value === 'skip' ? opponents.slice(1) : opponents;
    let drawTarget: Slot | null = null;
    if (isDrawCard && toVisit.length > 0) { drawTarget = toVisit[0]; toVisit = toVisit.slice(1); }

    if (card.color === 'wild') {
      setShowColorPicker(true);
      pendingWildTurn.current = { toVisit, drawTarget, drawAmount };
      return;
    }
    runTurnSequence(toVisit, drawTarget, drawAmount);
  };

  const handleDeckClick = () => {
    if (currentTurn !== 'player' || hasPlayableCard) return;
    setHand(prev => [...prev, randomCard()]);
    turnTimers.current.forEach(clearTimeout);
    turnTimers.current = [];
    runTurnSequence((OPPONENT_ORDER[playerCount] ?? OPPONENT_ORDER[4])[direction], null, 0);
  };

  const handleColorPick = (color: CardColor) => {
    setShowColorPicker(false);
    setActiveWildColor(color);
    const pending = pendingWildTurn.current;
    if (pending) {
      pendingWildTurn.current = null;
      runTurnSequence(pending.toVisit, pending.drawTarget, pending.drawAmount);
    }
  };

  const handleGoHome = () => {
    setWinExiting(true);
    setTimeout(() => navigate('/'), 750);
  };

// Render
  return (
    <div className="game">
      <img className="game-bg" src="/table.jpg" draggable={false} />

      {phase !== 'done' && <GameCurtain phase={phase} />}

      {phase === 'done' && (
        <>
          <TableCenter
            topCard={topCard}
            activeWildColor={activeWildColor}
            currentTurn={currentTurn}
            hasPlayableCard={hasPlayableCard}
            onDeckClick={handleDeckClick}
          />

          <OpponentLayout
            playerCount={playerCount}
            opponents={opponentNames}
            cardCounts={oppCounts}
            activeTurn={currentTurn}
          />

          {flyingCard && <FlyingCard slot={flyingCard} />}

          <PlayerHand hand={hand} onCardClick={handleCardClick} />

          <GameActions
            catchTarget={catchTarget}
            showSolo={hand.length === 1}
            soloCalled={soloCalled}
            onSolo={handleSolo}
            onCatch={handleCatch}
          />
        </>
      )}

      <SoloEffects showEffects={soloEffects} showSplash={showSoloSplash} />
      <CatchEffect show={showCatchEffect} />

      {showColorPicker && <ColorPicker onPick={handleColorPick} />}

      {winner !== null && (
        <WinScreen nickname={winner} onHome={handleGoHome} exiting={winExiting} />
      )}

      {winExiting && <GameCurtain phase="closing" exit />}
    </div>
  );
}
