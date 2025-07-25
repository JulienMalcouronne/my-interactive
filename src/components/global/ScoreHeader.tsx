'use client';

import React from 'react';
import { useUser } from './UserProvider';
import Button from './button/button';
import { useTranslations } from 'next-intl';

export default function ScoreHeader() {
  const { score, multiplier, increaseMultiplierClick } = useUser();
  const t = useTranslations();

  return (
    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
      <span className="font-bold text-green-500">
        {t('currentScore')} {score}
      </span>
      <Button
        onClick={increaseMultiplierClick}
        disabled={multiplier >= 5}
        className={[
          'select-none px-3 py-1 border rounded font-bold',
          multiplier >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100',
        ].join(' ')}
      >
        {t('scoreMultiplier')} {multiplier}×
      </Button>
    </div>
  );
}
