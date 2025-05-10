import React from "react";

import dynamic from 'next/dynamic'

const My3DScene = dynamic(
  () => import('@/components/My3dScene'),
)


export default function Home() {
  return (

    <div style={{ width: '100vw', height: '100vh' }}>
      <My3DScene />
    </div>

  );
}
