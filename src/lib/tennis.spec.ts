import { describe, expect, test } from 'vitest';
import {
  WIN_SCORE,
  MAX_BALL_VX,
  getTennisConfig,
  clamp,
  cpuPaddleTarget,
  moveToward,
  bounceOffPaddle,
  nextServeDirection,
  isMatchOver,
  matchWinner,
} from './tennis';

describe('getTennisConfig', () => {
  test('exposes the three difficulties, unbeatable being the fastest tracker', () => {
    expect(getTennisConfig('easy').cpuTracking).toBeLessThan(1);
    expect(getTennisConfig('normal').cpuTracking).toBeLessThan(1);
    const unbeatable = getTennisConfig('unbeatable');
    expect(unbeatable.cpuTracking).toBe(1);
    expect(unbeatable.cpuSpeed).toBeGreaterThan(getTennisConfig('normal').cpuSpeed);
  });
});

describe('clamp', () => {
  test('bounds a value', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('cpuPaddleTarget', () => {
  test('perfect tracking aims exactly at the ball', () => {
    expect(cpuPaddleTarget(120, 1, 450)).toBe(120);
  });

  test('imperfect tracking blends toward the court centre', () => {
    // center 225 ; ball 25 ; tracking 0.5 -> 225 + (25-225)*0.5 = 125
    expect(cpuPaddleTarget(25, 0.5, 450)).toBe(125);
  });
});

describe('moveToward', () => {
  test('snaps to the target when within reach', () => {
    expect(moveToward(100, 105, 10)).toBe(105);
  });

  test('steps by maxDelta upward', () => {
    expect(moveToward(100, 200, 10)).toBe(110);
  });

  test('steps by maxDelta downward', () => {
    expect(moveToward(100, 0, 10)).toBe(90);
  });
});

describe('bounceOffPaddle', () => {
  const config = getTennisConfig('normal');

  test('flips horizontal direction, speeds up and applies edge spin', () => {
    const result = bounceOffPaddle(-400, 0, 1, config);
    expect(result.vx).toBeGreaterThan(0); // was moving left, now right
    expect(Math.abs(result.vx)).toBeCloseTo(400 * config.ballSpeedup);
    expect(result.vy).toBe(config.maxBounceAngle); // hit the bottom edge
  });

  test('caps the horizontal speed', () => {
    const result = bounceOffPaddle(1000, 0, 0, config);
    expect(Math.abs(result.vx)).toBe(MAX_BALL_VX);
  });

  test('clamps an out-of-range hit offset', () => {
    expect(bounceOffPaddle(-300, 0, -2, config).vy).toBe(-config.maxBounceAngle);
  });
});

describe('nextServeDirection', () => {
  test('serves toward the side that conceded', () => {
    expect(nextServeDirection('player')).toBe(1);
    expect(nextServeDirection('cpu')).toBe(-1);
  });
});

describe('match end', () => {
  test('isMatchOver when a side reaches the winning score', () => {
    expect(isMatchOver(WIN_SCORE, 3)).toBe(true);
    expect(isMatchOver(3, WIN_SCORE)).toBe(true);
    expect(isMatchOver(6, 6)).toBe(false);
  });

  test('matchWinner reports the winner or null', () => {
    expect(matchWinner(WIN_SCORE, 2)).toBe('player');
    expect(matchWinner(2, WIN_SCORE)).toBe('cpu');
    expect(matchWinner(5, 6)).toBeNull();
  });
});
