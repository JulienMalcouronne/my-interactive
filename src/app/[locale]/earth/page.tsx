import React from 'react';

import dynamic from 'next/dynamic';

const Earth = dynamic(() => import('@/components/earth/Earth'));

export default function Airplane() {
  return (
    <div>
      <Earth />
    </div>
  );
}
