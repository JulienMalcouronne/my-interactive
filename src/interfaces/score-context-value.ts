export interface ScoreContextValue {
    score: number;
    multiplier: number;
    bumpScore: (by: number) => void;
    increaseMultiplier: () => void;
}