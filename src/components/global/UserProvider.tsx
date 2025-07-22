'use client';

import type { IUserContextValue } from '@/interfaces/user-context-value';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { generatePseudonym } from '@/lib';

const UserContext = createContext<IUserContextValue | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useScore must be used within a <ScoreProvider>');
  }
  return ctx;
}

export default function ScoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const intervalRef = useRef(multiplier);
  const MAX_MULTIPLIER = 5;

  useEffect(() => {
    const pseudonym = generatePseudonym();
    const fetchData = async () => {
      const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pseudonym }),
      });

      if (res.ok) {
        const data = (await res.json()) as { name: string; score: number; multiplier: string };
        setName(data.name);
        setScore(data.score);
        setMultiplier(Number(data.multiplier));
      } else {
        setName(pseudonym);
      }
    };

    fetchData().catch((err) => {
      console.error(err);
      setName(pseudonym);
    });
  }, []);

  useEffect(() => {
    window.increaseMultiplier = () => {
      setMultiplier(10);
    };

    window.hiddenSetScore = (consoleScore?: number) => {
      if (!consoleScore) {
        return;
      }

      if (consoleScore > 500) {
        console.log('Sorry you have been too greedy');
        return setScore(0);
      }

      return setScore(score + consoleScore);
    };

    return () => {
      delete window.increaseMultiplier;
      delete window.hiddenSetScore;
    };
  }, []);

  useEffect(() => {
    intervalRef.current = multiplier;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setScore((prev) => prev + intervalRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setScore((prev) => prev + 5 * multiplier);
  }, [pathname]);

  const bumpScore = (by: number) => setScore((prev) => prev + by);
  const increaseMultiplierClick = () =>
    setMultiplier((m) => {
      return m < MAX_MULTIPLIER ? +m + 1 : m;
    });

  return (
    <UserContext.Provider value={{ score, bumpScore, multiplier, increaseMultiplierClick, name }}>
      {children}
    </UserContext.Provider>
  );
}
