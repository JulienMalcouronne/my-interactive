interface IUserContextValue {
  score: number;
  multiplier: number;
  bumpScore: (by: number) => void;
  increaseMultiplierClick: () => void;
  name: string;
  uid: string;
}

export type { IUserContextValue };
