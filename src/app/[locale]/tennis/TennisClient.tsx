'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';

const TennisGame = dynamic(() => import('@/components/tennis/TennisGame'), { ssr: false });

export default function TennisClient() {
  return (
    <div className={styles.page}>
      <TennisGame />
    </div>
  );
}
