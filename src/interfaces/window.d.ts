export {};

declare global {
  interface Window {
    increaseMultiplier?: () => void;
    hiddenSetScore?: (score: number) => void;
  }
}
