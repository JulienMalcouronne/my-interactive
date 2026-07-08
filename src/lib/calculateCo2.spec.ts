import { expect, test, describe } from 'vitest';
import { calculateCO2 } from './calculateCo2';
import type { IIndividualCarbonFields } from '@/interfaces';

const base: IIndividualCarbonFields = {
  transportMode: 'walk', // factor 0
  carType: 'essence',
  dailyCommuteKm: 0,
  commuteDaysPerWeek: 5,
  carpoolSize: 1,
  shortFlightsPerYear: 0,
  mediumFlightsPerYear: 0,
  longFlightsPerYear: 0,
  meatConsumption: 'none', // 200 baseline
  homeSize: 0,
  heating: 'gas',
  isWellInsulated: false,
  hasRenewableElectricity: false,
  peopleInHousehold: 1,
  clothesPerYear: 0,
  devicesPerYear: 0,
};

const make = (overrides: Partial<IIndividualCarbonFields>): IIndividualCarbonFields => ({
  ...base,
  ...overrides,
});

const total = (overrides: Partial<IIndividualCarbonFields>) => calculateCO2(make(overrides)).total;

test('returns a per-category breakdown whose total is the sum of the categories', () => {
  const result = calculateCO2(
    make({ transportMode: 'car', carType: 'essence', dailyCommuteKm: 10, shortFlightsPerYear: 1 })
  );

  expect(result).toEqual({
    transport: 845,
    flights: 300,
    food: 200,
    heating: 0,
    clothes: 0,
    devices: 0,
    total: 1345,
  });
  const { total: sum, ...categories } = result;
  expect(Object.values(categories).reduce((a, b) => a + b, 0)).toBe(sum);
});

test('baseline (everything zeroed, meat none) equals the food floor', () => {
  expect(total(base)).toBe(200);
});

describe('transport', () => {
  test.each([
    ['essence', 1045],
    ['diesel', 952],
    ['electric', 266],
  ] as const)('car with %s fuel', (carType, expected) => {
    expect(total({ transportMode: 'car', carType, dailyCommuteKm: 10 })).toBe(expected);
  });

  test('non-car transport mode (bus)', () => {
    expect(total({ transportMode: 'bus', dailyCommuteKm: 10 })).toBe(662);
  });

  test('unknown transport mode falls back to 0', () => {
    expect(total({ transportMode: 'plane' as never, dailyCommuteKm: 10 })).toBe(200);
  });

  test('fewer commute days per week lowers the transport emissions', () => {
    // 10 * 2 * (44 * 2) * 0.192 = 337.92 -> 338 ; + food none 200 = 538
    expect(
      total({ transportMode: 'car', carType: 'essence', dailyCommuteKm: 10, commuteDaysPerWeek: 2 })
    ).toBe(538);
  });

  test('carpooling splits car emissions across occupants', () => {
    // 844.8 / 2 = 422.4 -> 422 ; + food none 200 = 622
    expect(
      total({ transportMode: 'car', carType: 'essence', dailyCommuteKm: 10, carpoolSize: 2 })
    ).toBe(622);
  });

  test('carpooling does not apply to non-car modes', () => {
    expect(total({ transportMode: 'bus', dailyCommuteKm: 10, carpoolSize: 4 })).toBe(662);
  });
});

describe('meat consumption', () => {
  test.each([
    ['high', 2000],
    ['medium', 1200],
    ['low', 600],
    ['none', 200],
  ] as const)('%s', (meatConsumption, expected) => {
    expect(total({ meatConsumption })).toBe(expected);
  });

  test('unknown meat consumption falls back to 0', () => {
    expect(total({ meatConsumption: 'daily' as never })).toBe(0);
  });
});

describe('flights', () => {
  test('short flights', () => {
    expect(total({ shortFlightsPerYear: 2 })).toBe(800);
  });

  test('medium flights', () => {
    expect(total({ mediumFlightsPerYear: 2 })).toBe(1600);
  });

  test('long flights', () => {
    expect(total({ longFlightsPerYear: 1 })).toBe(1700);
  });
});

describe('heating', () => {
  test('gas, not insulated', () => {
    expect(total({ homeSize: 100, heating: 'gas' })).toBe(220);
  });

  test('gas, well insulated applies the 0.8 coefficient', () => {
    expect(total({ homeSize: 100, heating: 'gas', isWellInsulated: true })).toBe(216);
  });

  test('electric', () => {
    expect(total({ homeSize: 100, heating: 'electric' })).toBe(206);
  });

  test('fuel', () => {
    expect(total({ homeSize: 100, heating: 'fuel' })).toBe(227);
  });

  test('unknown heating falls back to 0', () => {
    expect(total({ homeSize: 100, heating: 'wood' as never })).toBe(200);
  });

  test('heating is divided across the household', () => {
    expect(total({ homeSize: 100, heating: 'gas', peopleInHousehold: 2 })).toBe(210);
  });
});

describe('renewable electricity', () => {
  test('reduces electric heating', () => {
    // 100 * (0.06 * 0.3) = 1.8 -> 2 ; + food none 200 = 202 (vs 206 without)
    expect(total({ homeSize: 100, heating: 'electric', hasRenewableElectricity: true })).toBe(202);
  });

  test('reduces an electric car', () => {
    // 10 * 2 * 220 * (0.015 * 0.3) = 19.8 -> 20 ; + 200 = 220 (vs 266 without)
    expect(
      total({
        transportMode: 'car',
        carType: 'electric',
        dailyCommuteKm: 10,
        hasRenewableElectricity: true,
      })
    ).toBe(220);
  });
});

describe('clothes and devices', () => {
  test('clothes', () => {
    expect(total({ clothesPerYear: 4 })).toBe(300);
  });

  test('devices', () => {
    expect(total({ devicesPerYear: 2 })).toBe(500);
  });
});

test('rounds each category', () => {
  // car essence: 10 * 2 * 220 * 0.192 = 844.8 -> 845 ; + food none 200 = 1045
  expect(total({ transportMode: 'car', carType: 'essence', dailyCommuteKm: 10 })).toBe(1045);
});
