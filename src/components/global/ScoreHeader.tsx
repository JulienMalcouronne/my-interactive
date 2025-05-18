// app/components/ScoreHeader.tsx
"use client";

import React from "react";
import { useScore } from "./ScoreProvider";

export default function ScoreHeader() {
  const { score, multiplier, increaseMultiplier } = useScore();

  return (
    <>
      <span>Current score: {score}</span>
      <button
        onClick={increaseMultiplier}
        disabled={multiplier >= 5}
        className={[
          "select-none px-3 py-1 border rounded",
          multiplier >= 5
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-gray-100",
        ].join(" ")}
      >
        Score multiplier: {multiplier}×
      </button>
    </>
  );
}
