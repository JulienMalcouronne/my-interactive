'use client';

import { generatePseudonym } from '@/lib';
import { useState } from 'react';

export default function PseudonymDisplay() {
  const [name, setName] = useState(generatePseudonym);

  return <input type="text" defaultValue={name} className="ml-2 px-2 py-1 border rounded" />;
}
