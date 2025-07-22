'use client';

import { useEffect, useState } from 'react';
import { generatePseudonym } from '@/lib';

export default function PseudonymDisplay() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pseudonym = generatePseudonym();
    const fetchData = async () => {
      const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pseudonym }),
      });

      if (res.ok) {
        const data = (await res.json()) as { name: string };
        setName(data.name);
      } else {
        setName(pseudonym);
      }

      setLoading(false);
    };

    fetchData().catch((err) => {
      console.error(err);
      setName(pseudonym);
      setLoading(false);
    });
  }, []);

  if (loading) return <div></div>;

  return <input type="text" defaultValue={name} className="ml-2 px-2 py-1 border rounded" />;
}
