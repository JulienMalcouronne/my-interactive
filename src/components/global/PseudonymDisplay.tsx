'use client';

import { useUser } from './UserProvider';

export default function PseudonymDisplay() {
  const { name } = useUser();

  return <input type="text" defaultValue={name} className="ml-2 px-2 py-1 border rounded" />;
}
