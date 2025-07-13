'use client';

import React from 'react';
import { useScore } from './ScoreProvider';
import Button from './button/button';

export default function ScoreHeader() {
  const { score, multiplier, increaseMultiplier } = useScore();

  return (
    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
      <span className="font-bold text-green-500">Current score: {score}</span>
      <Button
        onClick={increaseMultiplier}
        disabled={multiplier >= 5}
        className={[
          'select-none px-3 py-1 border rounded font-bold',
          multiplier >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100',
        ].join(' ')}
      >
        Score multiplier: {multiplier}×
      </Button>
    </div>
  );
}
