import { expect, test, describe } from 'vitest';
import { calculateCO2 } from './calculateCo2';
import type { IIndividualCarbonFields } from '@/interfaces';

const base: IIndividualCarbonFields = {
  transportMode: 'walk', // factor 0
  carType: 'essence',
  dailyCommuteKm: 0,
  shortFlightsPerYear: 0,
  longFlightsPerYear: 0,
  meatConsumption: 'none', // 200 baseline
  homeSize: 0,
  heating: 'gas',
  isWellInsulated: false,
  peopleInHousehold: 1,
  clothesPerYear: 0,
  devicesPerYear: 0,
};

const make = (overrides: Partial<IIndividualCarbonFields>): IIndividualCarbonFields => ({
  ...base,
  ...overrides,
});

test('baseline (everything zeroed, meat none) equals the food floor', () => {
  expect(calculateCO2(base)).toBe(200);
});

describe('transport', () => {
  test.each([
    ['essence', 1045],
    ['diesel', 952],
    ['electric', 266],
  ] as const)('car with %s fuel', (carType, expected) => {
    expect(calculateCO2(make({ transportMode: 'car', carType, dailyCommuteKm: 10 }))).toBe(
      expected
    );
  });

  test('non-car transport mode (bus)', () => {
    expect(calculateCO2(make({ transportMode: 'bus', dailyCommuteKm: 10 }))).toBe(662);
  });

  test('unknown transport mode falls back to 0', () => {
    expect(calculateCO2(make({ transportMode: 'plane' as never, dailyCommuteKm: 10 }))).toBe(200);
  });
});

describe('meat consumption', () => {
  test.each([
    ['high', 2000],
    ['medium', 1200],
    ['low', 600],
    ['none', 200],
  ] as const)('%s', (meatConsumption, expected) => {
    expect(calculateCO2(make({ meatConsumption }))).toBe(expected);
  });

  test('unknown meat consumption falls back to 0', () => {
    expect(calculateCO2(make({ meatConsumption: 'daily' as never }))).toBe(0);
  });
});

describe('heating', () => {
  test('gas, not insulated', () => {
    expect(calculateCO2(make({ homeSize: 100, heating: 'gas' }))).toBe(220);
  });

  test('gas, well insulated applies the 0.8 coefficient', () => {
    expect(calculateCO2(make({ homeSize: 100, heating: 'gas', isWellInsulated: true }))).toBe(216);
  });

  test('electric', () => {
    expect(calculateCO2(make({ homeSize: 100, heating: 'electric' }))).toBe(206);
  });

  test('fuel', () => {
    expect(calculateCO2(make({ homeSize: 100, heating: 'fuel' }))).toBe(227);
  });

  test('unknown heating falls back to 0', () => {
    expect(calculateCO2(make({ homeSize: 100, heating: 'wood' as never }))).toBe(200);
  });

  test('heating is divided across the household', () => {
    expect(calculateCO2(make({ homeSize: 100, heating: 'gas', peopleInHousehold: 2 }))).toBe(210);
  });
});

describe('flights, clothes and devices', () => {
  test('short flights', () => {
    expect(calculateCO2(make({ shortFlightsPerYear: 2 }))).toBe(800);
  });

  test('long flights', () => {
    expect(calculateCO2(make({ longFlightsPerYear: 1 }))).toBe(1700);
  });

  test('clothes', () => {
    expect(calculateCO2(make({ clothesPerYear: 4 }))).toBe(300);
  });

  test('devices', () => {
    expect(calculateCO2(make({ devicesPerYear: 2 }))).toBe(500);
  });
});

test('rounds the final total', () => {
  // car essence: 10 * 2 * 220 * 0.192 = 844.8 ; + food none 200 = 1044.8 -> 1045
  expect(calculateCO2(make({ transportMode: 'car', carType: 'essence', dailyCommuteKm: 10 }))).toBe(
    1045
  );
});
