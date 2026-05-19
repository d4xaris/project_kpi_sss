import { useState, useEffect, useRef } from "react";
import { useLocation, useBlocker, useNavigate } from "react-router";
import { sounds } from "~/sounds";
import { useAuth, apiFetch } from "~/hooks/useAuth";
import { getSocket } from "~/socket/client";
import ColorPicker, { type CardColor } from "~/components/ColorPicker";
import OpponentLayout from "~/components/OpponentLayout";
import WinScreen from "~/components/WinScreen";
import TrollScreen from "~/components/TrollScreen";
import SoloEffects from "~/components/SoloEffects";
import CatchEffect from "~/components/CatchEffect";
import FlyingCard from "~/components/FlyingCard";
import GameCurtain from "~/components/GameCurtain";
import TableCenter from "~/components/TableCenter";
import PlayerHand from "~/components/PlayerHand";
import GameActions from "~/components/GameActions";
import { useSolo } from "~/hooks/useSolo";
import { useCatch } from "~/hooks/useCatch";
import { mkUid } from "~/types/game";
import type { Phase, Turn, Slot, Card, HandCard } from "~/types/game";

interface LocationState {
  fromRoom?: boolean;
  playerCount?: number;
  sessionId?: number;
}

// Game

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fromRoom = (location.state as LocationState)?.fromRoom === true;
  const playerCount = (location.state as LocationState)?.playerCount ?? 4;
  const sessionId = (location.state as LocationState)?.sessionId ?? null;

  // If the page was refreshed, location.state is lost — redirect home immediately
  if (!sessionId) {
    navigate("/", { replace: true });
    return null;
  }

  // State
  const [phase, setPhase] = useState<Phase>(fromRoom ? "closed" : "closing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showTroll, setShowTroll] = useState(false);
  const [winExiting, setWinExiting] = useState(false);
  const [hand, setHand] = useState<HandCard[]>([]);
  const [topCard, setTopCard] = useState<Card>({
    color: "wild",
    value: "wild",
  });
  const [currentTurn, setCurrentTurn] = useState<Turn>("player");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeWildColor, setActiveWildColor] = useState<CardColor | null>(
    null,
  );
  const [oppCounts, setOppCounts] = useState({ top: 0, left: 0, right: 0 });
  const [opponentNames, setOpponentNames] = useState<
    Partial<Record<Slot, string>>
  >({});
  const [flyingCard, setFlyingCard] = useState<Slot | null>(null);
  const [drawBuffer, setDrawBuffer] = useState(0);

  const turnTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pendingWildTurn = useRef<Card | null>(null);
  // Keep a stable ref to triggerSolo so the socket useEffect doesn't re-run every render
  const triggerSoloRef = useRef<() => void>(() => {});

  // When a draw penalty is active, only +2/+4 cards are playable (for stacking)
  const hasPlayableCard = drawBuffer > 0
    ? hand.some((c) => {
        if (c.value === "wild_draw4") return true;
        // +2 cannot stack on +4 — only counts as playable when top card is also +2
        if (c.value === "drawtwo" && topCard.value !== "wild_draw4") return true;
        return false;
      })
    : hand.some((c) => {
        if (c.color === "wild") return true;
        if (activeWildColor) return c.color === activeWildColor;
        return c.color === topCard.color || c.value === topCard.value;
      });

  const { soloCalled, showSoloSplash, soloEffects, handleSolo, triggerSolo } =
    useSolo(hand.length);
  const { catchTarget, showCatchEffect, handleCatch } = useCatch(
    oppCounts,
    (slot) => {
      setOppCounts((prev) => ({ ...prev, [slot]: prev[slot] + 2 }));
      const u = JSON.parse(localStorage.getItem("user") ?? "{}");
      getSocket().emit("catch_solo", { gameId: sessionId, userId: u.id, slot });
    },
  );

  // Effects
  useBlocker(() => phase === "done" && winner === null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    if (phase === "closed") sounds.start();
  }, [phase]);

  // Keep triggerSoloRef current without putting triggerSolo in socket deps
  useEffect(() => {
    triggerSoloRef.current = triggerSolo;
  }, [triggerSolo]);

  // Request fresh game state once on mount (handles arriving before the component mounted)
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") ?? "{}");
    if (sessionId && u.id) {
      getSocket().emit("request_game_state", { gameId: sessionId, userId: u.id });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-draw when a draw penalty is active and the player has no card to stack
  useEffect(() => {
    if (currentTurn !== "player" || drawBuffer === 0 || hasPlayableCard || isPlaying) return;
    const t = setTimeout(() => {
      setIsPlaying(true);
      getSocket().emit("draw_card", { gameId: sessionId, userId: user?.id });
    }, 600);
    return () => clearTimeout(t);
  }, [currentTurn, drawBuffer, hasPlayableCard, isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fromRoom) {
      const t1 = setTimeout(() => setPhase("opening"), 900);
      const t2 = setTimeout(() => setPhase("done"), 1650);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    const t1 = setTimeout(() => setPhase("closed"), 700);
    const t2 = setTimeout(() => setPhase("opening"), 1700);
    const t3 = setTimeout(() => setPhase("done"), 2450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on("game_state", (snapshot: any) => {
      setHand(prev => {
        const incoming: Card[] = snapshot.yourHand;
        const pool = [...prev];
        return incoming.map(card => {
          const idx = pool.findIndex(p => p.color === card.color && p.value === card.value);
          if (idx !== -1) {
            const existing = pool.splice(idx, 1)[0]!;
            return existing; // preserve UID so no re-deal animation
          }
          return { ...card, uid: mkUid() }; // truly new card → deal animation
        });
      });
      setTopCard(snapshot.topCard);
      setCurrentTurn(snapshot.currentTurn);
      setDrawBuffer(snapshot.drawBuffer ?? 0);
      if (snapshot.activeColor !== undefined) {
        setActiveWildColor((snapshot.activeColor as any) ?? null);
      }
      setOppCounts({
        top: snapshot.opponents.top?.cardCount ?? 0,
        left: snapshot.opponents.left?.cardCount ?? 0,
        right: snapshot.opponents.right?.cardCount ?? 0,
      });
      setOpponentNames({
        top: snapshot.opponents.top?.nickname,
        left: snapshot.opponents.left?.nickname,
        right: snapshot.opponents.right?.nickname,
      });
    });

    socket.on("game_turn", (data: { turn: Turn }) => {
      setCurrentTurn(data.turn);
      setIsPlaying(false);
    });

    socket.on("card_played", (data: { slot: Slot; card: Card }) => {
      setOppCounts((prev) => ({
        ...prev,
        [data.slot]: Math.max(0, prev[data.slot] - 1),
      }));
      setTopCard(data.card);
      setActiveWildColor(null);
      setFlyingCard(data.slot);
      setTimeout(() => setFlyingCard(null), 550);
    });

    socket.on("cards_drawn", (data: { cards: Card[] }) => {
      setHand((prev) => [
        ...prev,
        ...data.cards.map((c) => ({ ...c, uid: mkUid() })),
      ]);
    });

    socket.on("player_drew", (data: { slot: Slot; count: number }) => {
      setOppCounts((prev) => ({
        ...prev,
        [data.slot]: prev[data.slot] + data.count,
      }));
    });

    socket.on("solo_catch_result", (data: { slot: Slot; count: number }) => {
      setOppCounts((prev) => ({
        ...prev,
        [data.slot]: prev[data.slot] + data.count,
      }));
    });

    socket.on("color_chosen", (data: { color: CardColor }) => {
      setActiveWildColor(data.color);
    });

    socket.on(
      "game_finished",
      (data: { winnerId: number; winnerNickname: string }) => {
        setWinner(data.winnerNickname);
        if (sessionId) {
          apiFetch(`/game/${sessionId}/finish`, {
            method: "POST",
            body: JSON.stringify({ winnerId: data.winnerId }),
          }).catch(() => {});
        }
      },
    );

    socket.on("say_solo", () => {
      triggerSoloRef.current();
    });

    // If the server rejects our move, unlock the UI and pull fresh state
    socket.on("error_message", () => {
      setIsPlaying(false);
      const u = JSON.parse(localStorage.getItem("user") ?? "{}");
      if (sessionId && u.id) {
        socket.emit("request_game_state", { gameId: sessionId, userId: u.id });
      }
    });

    return () => {
      socket.off("game_state");
      socket.off("game_turn");
      socket.off("card_played");
      socket.off("cards_drawn");
      socket.off("player_drew");
      socket.off("solo_catch_result");
      socket.off("color_chosen");
      socket.off("game_finished");
      socket.off("say_solo");
      socket.off("error_message");
    };
  }, [sessionId]);

  // Handlers
  const handleCardClick = (card: Card, index: number) => {
    if (currentTurn !== "player" || isPlaying) return;

    if (card.value === "troll") {
      setHand((prev) => prev.filter((_, i) => i !== index));
      setWinner("__troll__");
      setShowTroll(true);
      return;
    }

    // Client-side validation — mirrors server rules so invalid cards are silently ignored
    if (drawBuffer > 0) {
      // A draw penalty is active: only stacking draw cards are allowed
      if (card.value !== "drawtwo" && card.value !== "wild_draw4") return;
      if (topCard.value === "wild_draw4" && card.value === "drawtwo") return;
    } else if (card.color !== "wild") {
      // Regular non-wild card: must match the active color or the top card's value
      const effectiveColor = activeWildColor ?? topCard.color;
      if (card.color !== effectiveColor && card.value !== topCard.value) return;
    }
    // Wild cards are always playable when there is no draw penalty

    setIsPlaying(true);
    setHand((prev) => prev.filter((_, i) => i !== index));
    setTopCard(card);
    setActiveWildColor(null);

    if (card.color === "wild") {
      setShowColorPicker(true);
      pendingWildTurn.current = card;
      return;
    }

    getSocket().emit("play_card", {
      gameId: sessionId,
      userId: user?.id,
      card,
    });
  };

  const handleDeckClick = () => {
    if (currentTurn !== "player" || hasPlayableCard || isPlaying) return;
    setIsPlaying(true);
    getSocket().emit("draw_card", { gameId: sessionId, userId: user?.id });
  };

  const handleColorPick = (color: CardColor) => {
    setShowColorPicker(false);
    setActiveWildColor(color);
    const card = pendingWildTurn.current;
    pendingWildTurn.current = null;
    if (card) {
      getSocket().emit("play_card", {
        gameId: sessionId,
        userId: user?.id,
        card,
      });
      getSocket().emit("choose_color", {
        gameId: sessionId,
        userId: user?.id,
        color,
      });
    }
  };

  const handleGoHome = () => {
    setWinExiting(true);
    setTimeout(() => navigate("/"), 750);
  };

  // Render
  return (
    <div className="game">
      <img className="game-bg" src="/table.jpg" draggable={false} />

      {phase !== "done" && <GameCurtain phase={phase} />}

      {phase === "done" && (
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
            onSolo={() => handleSolo(sessionId!, user?.id!)}
            onCatch={handleCatch}
          />
        </>
      )}

      <SoloEffects showEffects={soloEffects} showSplash={showSoloSplash} />
      <CatchEffect show={showCatchEffect} />

      {showColorPicker && <ColorPicker onPick={handleColorPick} />}

      {winner !== null && winner !== "__troll__" && (
        <WinScreen
          nickname={winner}
          onHome={handleGoHome}
          exiting={winExiting}
        />
      )}

      {showTroll && <TrollScreen />}

      {winExiting && <GameCurtain phase="closing" exit />}
    </div>
  );
}
