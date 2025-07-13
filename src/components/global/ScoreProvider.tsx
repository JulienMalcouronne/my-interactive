'use client';

import type { IScoreContextValue } from '@/interfaces';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const ScoreContext = createContext<IScoreContextValue | null>(null);

export function useScore() {
  const ctx = useContext(ScoreContext);
  if (!ctx) {
    throw new Error('useScore must be used within a <ScoreProvider>');
  }
  return ctx;
}

export default function ScoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [score, setScore] = useState(20);
  const [multiplier, setMultiplier] = useState(1);
  const intervalRef = useRef(multiplier);
  const MAX_MULTIPLIER = 5;

  useEffect(() => {
    intervalRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    const id = setInterval(() => {
      setScore((prev) => prev + intervalRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setScore((prev) => prev + 5 * multiplier);
  }, [pathname, multiplier]);

  const bumpScore = (by: number) => setScore((prev) => prev + by);
  const increaseMultiplier = () => setMultiplier((m) => (m < MAX_MULTIPLIER ? m + 1 : m));

  return (
    <ScoreContext.Provider value={{ score, bumpScore, multiplier, increaseMultiplier }}>
      {children}
    </ScoreContext.Provider>
  );
}
