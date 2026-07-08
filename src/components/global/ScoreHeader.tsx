'use client';

import React from 'react';
import { useUser } from './UserProvider';
import Button from './button/button';
import { useTranslations } from 'next-intl';
import styles from './ScoreHeader.module.css';

export default function ScoreHeader() {
  const { score, multiplier, increaseMultiplierClick } = useUser();
  const t = useTranslations();

  return (
    <div className={styles.header}>
      <span className={styles.score}>
        {t('currentScore')} {score}
      </span>
      <Button
        onClick={increaseMultiplierClick}
        disabled={multiplier >= 5}
        className={styles.multiplierBtn}
      >
        {t('scoreMultiplier')} {multiplier}×
      </Button>
    </div>
  );
}
