// Pure rules engine for the "Tennis" mini-game (a Pong-style 1v1 vs the CPU).
// Deterministic and side-effect free so it can be fully unit-tested; the canvas
// component runs the animation loop on top of these helpers.

export type Difficulty = 'easy' | 'normal' | 'unbeatable';
export type Side = 'player' | 'cpu';

export interface TennisConfig {
  cpuSpeed: number; // px/s the CPU paddle can travel
  cpuTracking: number; // 0..1 — how accurately it aims at the ball (1 = perfect)
  ballSpeed: number; // serve speed (px/s)
  ballSpeedup: number; // horizontal speed multiplier applied on each paddle hit
  maxBounceAngle: number; // max vertical speed imparted by a paddle edge (px/s)
}

export const WIN_SCORE = 7;
export const MAX_BALL_VX = 900;

const CONFIGS: Record<Difficulty, TennisConfig> = {
  easy: {
    cpuSpeed: 260,
    cpuTracking: 0.55,
    ballSpeed: 340,
    ballSpeedup: 1.03,
    maxBounceAngle: 340,
  },
  normal: {
    cpuSpeed: 360,
    cpuTracking: 0.7,
    ballSpeed: 380,
    ballSpeedup: 1.05,
    maxBounceAngle: 420,
  },
  // Perfect tracking + very high speed = the CPU always returns the ball.
  unbeatable: {
    cpuSpeed: 2000,
    cpuTracking: 1,
    ballSpeed: 480,
    ballSpeedup: 1.06,
    maxBounceAngle: 470,
  },
};

export function getTennisConfig(difficulty: Difficulty): TennisConfig {
  return CONFIGS[difficulty];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Where the CPU aims its paddle. Imperfect CPUs blend the ball position with the
// court centre; a perfect (unbeatable) CPU aims exactly at the ball.
export function cpuPaddleTarget(ballY: number, tracking: number, courtHeight: number): number {
  const center = courtHeight / 2;
  return center + (ballY - center) * tracking;
}

// Move `current` toward `target` by at most `maxDelta`.
export function moveToward(current: number, target: number, maxDelta: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

// New ball velocity after hitting a paddle. `hitOffset` is where it struck the
// paddle, from -1 (top edge) to 1 (bottom edge); the ball speeds up horizontally
// (capped) and the edge imparts vertical spin.
export function bounceOffPaddle(
  vx: number,
  vy: number,
  hitOffset: number,
  config: TennisConfig
): { vx: number; vy: number } {
  const nextVx = Math.min(Math.abs(vx) * config.ballSpeedup, MAX_BALL_VX);
  return {
    vx: -Math.sign(vx) * nextVx,
    vy: clamp(hitOffset, -1, 1) * config.maxBounceAngle,
  };
}

// Serve toward the side that just conceded the point (they get to return first).
export function nextServeDirection(scoredBy: Side): number {
  return scoredBy === 'player' ? 1 : -1; // +1 = toward CPU (right), -1 = toward player (left)
}

export function isMatchOver(playerScore: number, cpuScore: number): boolean {
  return playerScore >= WIN_SCORE || cpuScore >= WIN_SCORE;
}

export function matchWinner(playerScore: number, cpuScore: number): Side | null {
  if (playerScore >= WIN_SCORE) return 'player';
  if (cpuScore >= WIN_SCORE) return 'cpu';
  return null;
}
