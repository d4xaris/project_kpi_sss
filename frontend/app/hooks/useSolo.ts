import { useState, useEffect } from "react";
import { sounds } from "~/sounds";
import { getSocket } from "~/socket/client";

interface UseSoloReturn {
  soloCalled: boolean;
  showSoloSplash: boolean;
  soloEffects: boolean;
  handleSolo: (gameId: number, userId: number) => void;
  triggerSolo: () => void;
}

export function useSolo(handLength: number): UseSoloReturn {
  const [soloCalled, setSoloCalled] = useState(false);
  const [showSoloSplash, setShowSoloSplash] = useState(false);
  const [soloEffects, setSoloEffects] = useState(false);

  const triggerSolo = () => {
    sounds.solo();
    setShowSoloSplash(true);
    setSoloEffects(true);
    setTimeout(() => setShowSoloSplash(false), 1500);
    setTimeout(() => setSoloEffects(false), 1800);
  };

  const handleSolo = (gameId: number, userId: number) => {
    if (soloCalled) return;
    setSoloCalled(true);
    triggerSolo();
    getSocket().emit("say_solo", { gameId, userId });
  };

  useEffect(() => {
    if (handLength !== 1) setSoloCalled(false);
  }, [handLength]);

  return { soloCalled, showSoloSplash, soloEffects, handleSolo, triggerSolo };
}
