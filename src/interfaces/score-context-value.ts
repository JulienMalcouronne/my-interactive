interface IScoreContextValue {
  score: number;
  multiplier: number;
  bumpScore: (by: number) => void;
  increaseMultiplier: () => void;
}

export type { IScoreContextValue };
