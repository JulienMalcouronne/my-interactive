'use client';
import React from 'react';
import { useUser } from '../global/UserProvider';

type Props = { users: { uid: string; score: number }[] };

export default function CurrentUserRow({ users }: Props) {
  const { uid } = useUser();
  const index = users.findIndex((u) => u.uid === uid);
  const currentUser = index >= 0 ? users[index] : null;

  return (
    <tr className="hover:bg-gray-50 transition">
      <th scope="row" colSpan={2} className="px-6 py-4 text-left">
        {currentUser ? `My rank: ${index + 1}` : 'My rank: —'}
      </th>
      <td className="px-6 py-4 font-bold">{currentUser ? currentUser.score : '—'}</td>
    </tr>
  );
}
