import { describe, expect, test } from 'vitest';
import {
  DOGS,
  ZONES,
  WEATHERS,
  SOCIABILITY_MAX,
  UPGRADE_MAX,
  pickZone,
  getWeather,
  getLevelConfig,
  upgradeCost,
  canBuy,
  collectionRadius,
  applyTreat,
  collide,
  isWalkComplete,
  isWalkOver,
  payout,
  nextDogIndex,
  sociabilityDecay,
  nearMissReward,
  NEAR_MISS_BONUS,
  type WalkStats,
  type CollisionContext,
} from './dogWalk';

const rex = DOGS[0];
const stats = (over: Partial<WalkStats> = {}): WalkStats => ({
  sociability: 50,
  money: 0,
  treats: 0,
  combo: 0,
  ...over,
});
const ctx = (over: Partial<CollisionContext> = {}): CollisionContext => ({
  immune: false,
  comboActive: false,
  ...over,
});

describe('cycles', () => {
  test('pickZone cycles by level', () => {
    expect(pickZone(1)).toBe(ZONES[0]);
    expect(pickZone(ZONES.length + 1)).toBe(ZONES[0]);
  });

  test('getWeather cycles by level', () => {
    expect(getWeather(1)).toBe(WEATHERS[0]);
    expect(getWeather(WEATHERS.length + 1)).toBe(WEATHERS[0]);
  });
});

describe('getLevelConfig', () => {
  test('level 1 baseline (default upgrades)', () => {
    const cfg = getLevelConfig(1, rex);
    expect(cfg.speed).toBe(210);
    expect(cfg.spawnInterval).toBe(820);
    expect(cfg.meanDogChance).toBeCloseTo(0.18);
    expect(cfg.hasBoss).toBe(false);
    expect(cfg.zone).toBe(ZONES[0]);
    expect(cfg.weather).toBe(WEATHERS[0]);
  });

  test('difficulty ramps and every third level has a boss', () => {
    const cfg = getLevelConfig(3, rex);
    expect(cfg.speed).toBeGreaterThan(getLevelConfig(1, rex).speed);
    expect(cfg.hasBoss).toBe(true);
  });

  test('faster dogs scale the speed', () => {
    expect(getLevelConfig(1, DOGS[1]).speed).toBeGreaterThan(getLevelConfig(1, rex).speed);
  });

  test('the calm upgrade slows the dog down', () => {
    expect(getLevelConfig(1, rex, { leash: 0, calm: 2 }).speed).toBeLessThan(
      getLevelConfig(1, rex).speed
    );
  });

  test('clamps spawn interval and mean-dog chance at high levels', () => {
    const cfg = getLevelConfig(50, rex);
    expect(cfg.spawnInterval).toBe(300);
    expect(cfg.meanDogChance).toBe(0.65);
  });
});

describe('shop', () => {
  test('upgrade cost scales with the current level', () => {
    expect(upgradeCost(0)).toBe(40);
    expect(upgradeCost(2)).toBe(120);
  });

  test('canBuy respects money and the max level', () => {
    expect(canBuy(40, 0)).toBe(true);
    expect(canBuy(39, 0)).toBe(false);
    expect(canBuy(9999, UPGRADE_MAX)).toBe(false);
  });

  test('collectionRadius widens with the leash', () => {
    expect(collectionRadius(26, 0)).toBe(26);
    expect(collectionRadius(26, 3)).toBe(50);
  });
});

describe('applyTreat', () => {
  test('a treat within tolerance builds the combo and fills the gauge', () => {
    expect(applyTreat(stats(), rex, false)).toEqual({
      sociability: 55,
      money: 3,
      treats: 1,
      combo: 1,
    });
  });

  test('golden-bone combo doubles the reward', () => {
    const result = applyTreat(stats(), rex, true);
    expect(result.money).toBe(6);
    expect(result.sociability).toBe(60);
  });

  test('over-eating makes the dog sick and breaks the combo', () => {
    const result = applyTreat(stats({ treats: rex.treatTolerance, combo: 4 }), rex, false);
    expect(result.treats).toBe(rex.treatTolerance + 1);
    expect(result.combo).toBe(0);
    expect(result.sociability).toBe(40);
    expect(result.money).toBe(0);
  });

  test('sociability gain is clamped to the max', () => {
    expect(applyTreat(stats({ sociability: 98, combo: 5 }), rex, false).sociability).toBe(
      SOCIABILITY_MAX
    );
  });
});

describe('collide', () => {
  test('treat delegates to applyTreat', () => {
    expect(collide('treat', stats(), rex, ctx()).stats.money).toBe(3);
  });

  test('poop lowers sociability and breaks the combo', () => {
    const { stats: next } = collide('poop', stats({ sociability: 50, combo: 3 }), rex, ctx());
    expect(next.sociability).toBe(36);
    expect(next.combo).toBe(0);
  });

  test('poop is ignored while immune (bag active)', () => {
    const before = stats({ sociability: 50, combo: 3 });
    const { stats: next } = collide('poop', before, rex, ctx({ immune: true }));
    expect(next).toEqual(before);
  });

  test('nice dog boosts sociability and money', () => {
    const { stats: next } = collide('niceDog', stats({ sociability: 50 }), rex, ctx());
    expect(next).toEqual({ sociability: 58, money: 8, treats: 0, combo: 0 });
  });

  test('mean dog lowers sociability', () => {
    expect(collide('meanDog', stats({ sociability: 50 }), rex, ctx()).stats.sociability).toBe(38);
  });

  test('the catcher boss is a big hit', () => {
    expect(collide('catcher', stats({ sociability: 50 }), rex, ctx()).stats.sociability).toBe(25);
  });

  test('ball triggers the slow power-up', () => {
    expect(collide('ball', stats(), rex, ctx()).powerUp).toBe('slow');
  });

  test('bag triggers the immunity power-up', () => {
    expect(collide('bag', stats(), rex, ctx()).powerUp).toBe('immunity');
  });

  test('golden bone triggers the combo power-up and a small bonus', () => {
    const result = collide('goldenBone', stats({ sociability: 50 }), rex, ctx());
    expect(result.powerUp).toBe('combo');
    expect(result.stats.sociability).toBe(55);
  });

  test('sociability never drops below zero', () => {
    expect(collide('catcher', stats({ sociability: 5 }), rex, ctx()).stats.sociability).toBe(0);
  });
});

describe('sociabilityDecay', () => {
  test('starts gentle and ramps with the level', () => {
    expect(sociabilityDecay(1)).toBeCloseTo(0.8);
    expect(sociabilityDecay(5)).toBeCloseTo(1.6);
  });

  test('is capped at high levels', () => {
    expect(sociabilityDecay(100)).toBe(2.5);
  });
});

describe('nearMissReward', () => {
  test('grants the near-miss bonus without touching the rest', () => {
    const result = nearMissReward(stats({ money: 3, combo: 2 }));
    expect(result.money).toBe(3 + NEAR_MISS_BONUS);
    expect(result.combo).toBe(2);
  });
});

describe('walk outcome', () => {
  test('isWalkComplete when the gauge is full', () => {
    expect(isWalkComplete(SOCIABILITY_MAX)).toBe(true);
    expect(isWalkComplete(99)).toBe(false);
  });

  test('isWalkOver when the gauge is empty', () => {
    expect(isWalkOver(0)).toBe(true);
    expect(isWalkOver(1)).toBe(false);
  });

  test('payout combines money and a level bonus', () => {
    expect(payout(stats({ money: 15 }), 2)).toBe(51);
  });

  test('nextDogIndex cycles through the roster', () => {
    expect(nextDogIndex(0)).toBe(1);
    expect(nextDogIndex(DOGS.length - 1)).toBe(0);
  });
});
