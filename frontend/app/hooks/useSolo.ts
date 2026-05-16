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
    const key = 'sss:solo';
    localStorage.setItem(key, Date.now().toString());
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: Date.now().toString() }));
  };

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'sss:solo') triggerSolo();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    if (handLength !== 1) setSoloCalled(false);
  }, [handLength]);

  return { soloCalled, showSoloSplash, soloEffects, handleSolo };
}
