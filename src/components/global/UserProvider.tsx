'use client';

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { generatePseudonym } from '@/lib';
import type { IUserContextValue } from '@/interfaces/user-context-value';

const UserContext = createContext<IUserContextValue | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a <ScoreProvider>');
  return ctx;
}

export default function ScoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  const [uid, setUid] = useState('');
  const intervalRef = useRef(multiplier);
  const latestScoreRef = useRef(score);
  const latestMultiplierRef = useRef(multiplier);
  const MAX_MULTIPLIER = 5;

  useEffect(() => {
    const pseudonym = generatePseudonym();

    const fetchData = async () => {
      try {
        const res = await fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: pseudonym }),
        });

        if (res.ok) {
          const data = (await res.json()) as {
            name: string;
            score?: number;
            multiplier: string;
            uid: string;
          };
          setName(data.name);
          setScore(data.score ?? 0);
          setMultiplier(Number(data.multiplier ?? 1));
          setUid(data.uid);
        } else {
          setName(pseudonym);
        }
      } catch (err) {
        console.error(err);
        setName(pseudonym);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    window.increaseMultiplier = () => {
      setMultiplier(10);
    };

    window.hiddenSetScore = (consoleScore?: number) => {
      if (!consoleScore) return;
      if (consoleScore > 500) {
        console.log('Sorry you have been too greedy');
        return setScore(0);
      }
      setScore((prev) => prev + consoleScore);
    };

    return () => {
      delete window.increaseMultiplier;
      delete window.hiddenSetScore;
    };
  }, []);

  useEffect(() => {
    intervalRef.current = multiplier;
    latestScoreRef.current = score;
    latestMultiplierRef.current = multiplier;
  }, [score, multiplier]);

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
  const increaseMultiplierClick = () => setMultiplier((m) => (m < MAX_MULTIPLIER ? m + 1 : m));

  useEffect(() => {
    const id = setInterval(() => {
      const updateUser = async () => {
        try {
          await fetch('/api/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              score: latestScoreRef.current ?? 0,
              multiplier: latestMultiplierRef.current ?? 1,
            }),
          });
        } catch (e) {
          console.error('Failed to patch user state', e);
        }
      };
      updateUser();
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return (
    <UserContext.Provider
      value={{ score, bumpScore, multiplier, increaseMultiplierClick, name, uid }}
    >
      {children}
    </UserContext.Provider>
  );
}
