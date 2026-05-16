import { useState, useEffect, useRef } from 'react';
import { sounds } from '~/sounds';

type Slot = 'top' | 'left' | 'right';

interface UseCatchReturn {
  catchTarget:     Slot | null;
  showCatchEffect: boolean;
  handleCatch:     (slot: Slot) => void;
}

export function useCatch(
  oppCounts: Record<Slot, number>,
  onCatch:   (slot: Slot) => void,
): UseCatchReturn {
  const [catchTarget,     setCatchTarget]     = useState<Slot | null>(null);
  const [showCatchEffect, setShowCatchEffect] = useState(false);

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef      = useRef({ ...oppCounts });

  useEffect(() => {
    const prev = prevRef.current;
    (['top', 'left', 'right'] as const).forEach(slot => {
      if (prev[slot] > 1 && oppCounts[slot] === 1) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCatchTarget(slot);
        timerRef.current = setTimeout(() => setCatchTarget(null), 3000);
      }
    });
    prevRef.current = { ...oppCounts };
  }, [oppCounts]);

  useEffect(() => () => {
    if (timerRef.current)    clearTimeout(timerRef.current);
    if (effectTimer.current) clearTimeout(effectTimer.current);
  }, []);

  const handleCatch = (slot: Slot) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCatchTarget(null);

    sounds.catch();
    setShowCatchEffect(true);
    if (effectTimer.current) clearTimeout(effectTimer.current);
    effectTimer.current = setTimeout(() => setShowCatchEffect(false), 1300);

    onCatch(slot);
  };

  return { catchTarget, showCatchEffect, handleCatch };
}
