import React from "react";

import dynamic from "next/dynamic";

const Earth = dynamic(() => import("@/components/airplane/Earth"));

export default function Airplane() {
  return (
    <div>
      <Earth />
    </div>
  );
}
