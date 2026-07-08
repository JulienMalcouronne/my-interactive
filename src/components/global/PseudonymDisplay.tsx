'use client';

import { useUser } from './UserProvider';
import styles from './PseudonymDisplay.module.css';

export default function PseudonymDisplay() {
  const { name } = useUser();

  return <input type="text" defaultValue={name} className={styles.input} />;
}
