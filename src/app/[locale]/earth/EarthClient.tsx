'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Earth = dynamic(() => import('@/components/earth/Earth'), {
  ssr: false,
});

export default function EarthClient() {
  return (
    <div>
      <Earth />
    </div>
  );
}
