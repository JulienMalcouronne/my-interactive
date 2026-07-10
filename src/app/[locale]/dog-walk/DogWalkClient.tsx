'use client';

import dynamic from 'next/dynamic';
import styles from './page.module.css';

const DogWalkGame = dynamic(() => import('@/components/dogwalk/DogWalkGame'), { ssr: false });

export default function DogWalkClient() {
  return (
    <div className={styles.page}>
      <DogWalkGame />
    </div>
  );
}
