import { useState, useEffect } from 'react';
import { sounds } from '~/sounds';

interface UseSoloReturn {
  soloCalled:     boolean;
  showSoloSplash: boolean;
  soloEffects:    boolean;
  handleSolo:     () => void;
}

export function useSolo(handLength: number): UseSoloReturn {
  const [soloCalled,     setSoloCalled]     = useState(false);
  const [showSoloSplash, setShowSoloSplash] = useState(false);
  const [soloEffects,    setSoloEffects]    = useState(false);

  const triggerSolo = () => {
    sounds.solo();
    setShowSoloSplash(true);
    setSoloEffects(true);
    setTimeout(() => setShowSoloSplash(false), 1500);
    setTimeout(() => setSoloEffects(false),    1800);
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

  // Reset soloCalled when hand goes back above 1 card
  useEffect(() => {
    if (handLength !== 1) setSoloCalled(false);
  }, [handLength]);

  return { soloCalled, showSoloSplash, soloEffects, handleSolo };
}
