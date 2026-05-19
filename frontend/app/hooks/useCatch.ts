import { useState, useEffect, useRef } from 'react';
import { sounds } from '~/sounds';

type Slot = 'top' | 'left' | 'right';

interface UseCatchReturn {
  catchTarget:       Slot | null;
  showCatchEffect:   boolean;
  handleCatch:       (slot: Slot) => void;
  triggerForSlot:    (slot: Slot) => void;
  closeCatchForSlot: (slot: Slot) => void;
  catchLocked:       boolean;
  clearCatch:        () => void;
}

export function useCatch(
  oppCounts: Record<Slot, number>,
  onCatch:   (slot: Slot) => void,
): UseCatchReturn {
  const [catchTarget,     setCatchTarget]     = useState<Slot | null>(null);
  const [showCatchEffect, setShowCatchEffect] = useState(false);
  const [catchLocked,     setCatchLocked]     = useState(false);

  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockTimer       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catchLockedRef  = useRef(false);
  const catchTargetRef  = useRef<Slot | null>(null);
  const prevRef         = useRef({ ...oppCounts });

  // Keep a ref in sync so closeCatchForSlot can read it without stale closure
  useEffect(() => { catchTargetRef.current = catchTarget; }, [catchTarget]);

  useEffect(() => {
    const prev = prevRef.current;
    (['top', 'left', 'right'] as const).forEach(slot => {
      if (prev[slot] > 1 && oppCounts[slot] === 1) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCatchTarget(slot);
        catchTargetRef.current = slot;
        timerRef.current = setTimeout(() => {
          setCatchTarget(null);
          catchTargetRef.current = null;
        }, 3000);
      }
    });
    prevRef.current = { ...oppCounts };
  }, [oppCounts]);

  useEffect(() => () => {
    if (timerRef.current)    clearTimeout(timerRef.current);
    if (effectTimer.current) clearTimeout(effectTimer.current);
    if (lockTimer.current)   clearTimeout(lockTimer.current);
  }, []);

  // Cancel the catch window entirely (e.g. when local player presses SOLO)
  const clearCatch = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setCatchTarget(null);
    catchTargetRef.current = null;
  };

  // Close catch window only if it targets the given slot
  // (called when that opponent calls SOLO — they are now protected)
  const closeCatchForSlot = (slot: Slot) => {
    if (catchTargetRef.current === slot) {
      clearCatch();
    }
  };

  const triggerForSlot = (slot: Slot) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCatchTarget(slot);
    catchTargetRef.current = slot;
    timerRef.current = setTimeout(() => {
      setCatchTarget(null);
      catchTargetRef.current = null;
    }, 3000);
  };

  const handleCatch = (slot: Slot) => {
    if (catchLockedRef.current) return;
    catchLockedRef.current = true;
    setCatchLocked(true);
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      catchLockedRef.current = false;
      setCatchLocked(false);
    }, 3000);

    if (timerRef.current) clearTimeout(timerRef.current);
    setCatchTarget(null);
    catchTargetRef.current = null;

    sounds.catch();
    setShowCatchEffect(true);
    if (effectTimer.current) clearTimeout(effectTimer.current);
    effectTimer.current = setTimeout(() => setShowCatchEffect(false), 1300);

    onCatch(slot);
  };

  return {
    catchTarget,
    showCatchEffect,
    handleCatch,
    triggerForSlot,
    closeCatchForSlot,
    catchLocked,
    clearCatch,
  };
}
