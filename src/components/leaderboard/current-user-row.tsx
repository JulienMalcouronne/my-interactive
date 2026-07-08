'use client';
import React from 'react';
import { useUser } from '../global/UserProvider';
import styles from './current-user-row.module.css';

type Props = { users: { uid: string; score: number }[] };

export default function CurrentUserRow({ users }: Props) {
  const { uid } = useUser();
  const index = users.findIndex((u) => u.uid === uid);
  const currentUser = index >= 0 ? users[index] : null;

  return (
    <tr className={styles.row}>
      <th scope="row" colSpan={2} className={styles.rankHead}>
        {currentUser ? `My rank: ${index + 1}` : 'My rank: —'}
      </th>
      <td className={styles.score}>{currentUser ? currentUser.score : '—'}</td>
    </tr>
  );
}
