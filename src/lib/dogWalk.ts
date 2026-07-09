// Pure rules engine for the "Dog Walker" mini-game. Deterministic and
// side-effect free so it can be fully unit-tested; the canvas component drives
// the animation and timed effects on top of these helpers.

export type EntityKind =
  | 'poop'
  | 'treat'
  | 'niceDog'
  | 'meanDog'
  | 'catcher' // boss: the dog-catcher van
  | 'ball' // power-up: slows everything down
  | 'bag' // power-up: brief poop immunity
  | 'goldenBone'; // power-up: treats count double for a while

export type PowerUp = 'slow' | 'immunity' | 'combo';

export interface DogBreed {
  id: string;
  name: string;
  emoji: string;
  startSociability: number; // 0..100 (you must fill it to 100 to finish)
  treatTolerance: number; // treats before the dog gets sick
  speedMultiplier: number; // >1 walks faster
}

export const DOGS: DogBreed[] = [
  {
    id: 'rex',
    name: 'Rex',
    emoji: '🐕',
    startSociability: 45,
    treatTolerance: 8,
    speedMultiplier: 1,
  },
  {
    id: 'bella',
    name: 'Bella',
    emoji: '🐩',
    startSociability: 40,
    treatTolerance: 5,
    speedMultiplier: 1.3,
  },
  {
    id: 'max',
    name: 'Max',
    emoji: '🦮',
    startSociability: 55,
    treatTolerance: 10,
    speedMultiplier: 0.95,
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🐕‍🦺',
    startSociability: 30,
    treatTolerance: 6,
    speedMultiplier: 1.15,
  },
  {
    id: 'zeus',
    name: 'Zeus',
    emoji: '🐺',
    startSociability: 50,
    treatTolerance: 12,
    speedMultiplier: 1.2,
  },
];

export interface ZoneTheme {
  id: string;
  sky: string;
  ground: string;
}

export const ZONES: ZoneTheme[] = [
  { id: 'park', sky: '#dcfce7', ground: '#bbf7d0' },
  { id: 'suburb', sky: '#e0f2fe', ground: '#bae6fd' },
  { id: 'downtown', sky: '#e5e7eb', ground: '#d1d5db' },
  { id: 'forest', sky: '#d1fae5', ground: '#a7f3d0' },
  { id: 'beach', sky: '#fef9c3', ground: '#fde68a' },
  { id: 'night', sky: '#1e293b', ground: '#334155' },
];

export interface Weather {
  id: string;
  emoji: string;
  speedMod: number;
  spawnMod: number; // <1 means faster spawns
}

export const WEATHERS: Weather[] = [
  { id: 'clear', emoji: '☀️', speedMod: 1, spawnMod: 1 },
  { id: 'rain', emoji: '🌧️', speedMod: 1.12, spawnMod: 0.85 },
  { id: 'wind', emoji: '💨', speedMod: 1.22, spawnMod: 1 },
];

export const SOCIABILITY_MAX = 100;
export const WIN_SOCIABILITY = SOCIABILITY_MAX;

export function pickZone(level: number): ZoneTheme {
  return ZONES[(level - 1) % ZONES.length];
}

export function getWeather(level: number): Weather {
  return WEATHERS[(level - 1) % WEATHERS.length];
}

export interface UpgradeState {
  leash: number; // widens the collection radius
  calm: number; // calmer dogs = slower walk
}

export const NO_UPGRADES: UpgradeState = { leash: 0, calm: 0 };
export const UPGRADE_MAX = 3;
export const UPGRADE_BASE_COST = 40;

export function upgradeCost(currentLevel: number): number {
  return UPGRADE_BASE_COST * (currentLevel + 1);
}

export function canBuy(money: number, currentLevel: number): boolean {
  return currentLevel < UPGRADE_MAX && money >= upgradeCost(currentLevel);
}

export function collectionRadius(baseRadius: number, leash: number): number {
  return baseRadius + leash * 8;
}

export interface LevelConfig {
  level: number;
  speed: number; // base scroll speed (px/s)
  spawnInterval: number; // ms between spawns
  meanDogChance: number; // 0..1 of dog spawns that are mean
  zone: ZoneTheme;
  weather: Weather;
  hasBoss: boolean;
}

export function getLevelConfig(
  level: number,
  dog: DogBreed,
  upgrades: UpgradeState = NO_UPGRADES
): LevelConfig {
  const weather = getWeather(level);
  return {
    level,
    speed: Math.round(
      (210 + (level - 1) * 55) * dog.speedMultiplier * weather.speedMod * (1 - upgrades.calm * 0.07)
    ),
    spawnInterval: Math.max(300, Math.round((820 - (level - 1) * 55) * weather.spawnMod)),
    meanDogChance: Math.min(0.65, 0.18 + (level - 1) * 0.05),
    zone: pickZone(level),
    weather,
    hasBoss: level % 3 === 0,
  };
}

export interface WalkStats {
  sociability: number;
  money: number;
  treats: number;
  combo: number; // consecutive treats without over-eating
}

export interface CollisionContext {
  immune: boolean; // poop-bag power-up active
  comboActive: boolean; // golden-bone power-up active
}

export interface CollisionResult {
  stats: WalkStats;
  powerUp: PowerUp | null;
}

const clampSoc = (value: number) => Math.max(0, Math.min(SOCIABILITY_MAX, value));

export function applyTreat(stats: WalkStats, dog: DogBreed, comboActive: boolean): WalkStats {
  const treats = stats.treats + 1;
  if (treats > dog.treatTolerance) {
    // Over-eating: the dog gets sick, loses sociability and breaks the combo.
    return { ...stats, treats, combo: 0, sociability: clampSoc(stats.sociability - 10) };
  }
  const combo = stats.combo + 1;
  const multiplier = comboActive ? 2 : 1;
  const gain = (4 + Math.min(combo, 6)) * multiplier; // longer streak = bigger gain
  return {
    ...stats,
    treats,
    combo,
    money: stats.money + 3 * multiplier,
    sociability: clampSoc(stats.sociability + gain),
  };
}

export function collide(
  kind: EntityKind,
  stats: WalkStats,
  dog: DogBreed,
  ctx: CollisionContext
): CollisionResult {
  if (kind === 'treat') return { stats: applyTreat(stats, dog, ctx.comboActive), powerUp: null };
  if (kind === 'poop') {
    if (ctx.immune) return { stats, powerUp: null };
    return {
      stats: { ...stats, combo: 0, sociability: clampSoc(stats.sociability - 14) },
      powerUp: null,
    };
  }
  if (kind === 'niceDog') {
    return {
      stats: { ...stats, money: stats.money + 8, sociability: clampSoc(stats.sociability + 8) },
      powerUp: null,
    };
  }
  if (kind === 'meanDog') {
    return {
      stats: { ...stats, combo: 0, sociability: clampSoc(stats.sociability - 12) },
      powerUp: null,
    };
  }
  if (kind === 'catcher') {
    return {
      stats: { ...stats, combo: 0, sociability: clampSoc(stats.sociability - 25) },
      powerUp: null,
    };
  }
  if (kind === 'ball') return { stats, powerUp: 'slow' };
  if (kind === 'bag') return { stats, powerUp: 'immunity' };
  // goldenBone
  return { stats: { ...stats, sociability: clampSoc(stats.sociability + 5) }, powerUp: 'combo' };
}

// Sociability drains over time: the walker has to stay active to fill the gauge.
export function sociabilityDecay(level: number): number {
  return Math.min(2.5, 0.8 + (level - 1) * 0.2);
}

export const NEAR_MISS_BONUS = 2;

// Reward for dodging a poop by a whisker.
export function nearMissReward(stats: WalkStats): WalkStats {
  return { ...stats, money: stats.money + NEAR_MISS_BONUS };
}

export function isWalkComplete(sociability: number): boolean {
  return sociability >= WIN_SOCIABILITY;
}

export function isWalkOver(sociability: number): boolean {
  return sociability <= 0;
}

export function payout(stats: WalkStats, level: number): number {
  // Collected money + a completion bonus that grows with the level.
  return Math.round(stats.money + 20 + level * 8);
}

export function nextDogIndex(current: number): number {
  return (current + 1) % DOGS.length;
}
