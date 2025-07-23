'use client';

import React from 'react';
import { useUser } from '../global/UserProvider';

type CurrentUserRowProps = {
  // TODO type this
  users: { uid: string; score: number }[];
};

export default function CurrentUserRow({ users }: CurrentUserRowProps) {
  const { uid } = useUser();
  const index = users.findIndex((user) => user.uid === uid);
  const currentUser = users[index];

  if (index === -1 || !currentUser) return null;

  return (
    <tr className="hover:bg-gray-50 transition">
      <th scope="row" colSpan={2} className="px-6 py-4 text-left">
        My rank: {index + 1}
      </th>
      <td className="px-6 py-4 font-bold">{currentUser.score}</td>
    </tr>
  );
}
