import type { IIndividualCarbonFields } from '@/interfaces';

const calculateCO2 = (form: IIndividualCarbonFields): number => {
  const {
    transportMode,
    carType,
    dailyCommuteKm,
    shortFlightsPerYear,
    longFlightsPerYear,
    meatConsumption,
    homeSize,
    heating,
    isWellInsulated,
    peopleInHousehold,
    clothesPerYear,
    devicesPerYear,
  } = form;

  const carEmissionFactors: Record<string, number> = {
    essence: 0.192,
    diesel: 0.171,
    electric: 0.015,
  } as const;

  const heatingFactors: Record<string, number> = {
    gas: 0.198,
    electric: 0.06,
    fuel: 0.27,
  } as const;

  const meatFactors: Record<string, number> = {
    high: 2000,
    medium: 1200,
    low: 600,
    none: 200,
  } as const;

  const transportFactors: Record<string, number> = {
    car: carEmissionFactors[carType],
    bus: 0.105,
    metro: 0.004,
    train: 0.006,
    bike: 0,
    walk: 0,
    telework: 0,
  } as const;

  const transportEmissions = dailyCommuteKm * 2 * 220 * (transportFactors[transportMode] ?? 0);

  const flightEmissions = shortFlightsPerYear * 300 + longFlightsPerYear * 1500;

  const foodEmissions = meatFactors[meatConsumption] ?? 0;

  const heatingTotal = homeSize * (heatingFactors[heating] ?? 0) * (isWellInsulated ? 0.8 : 1);
  const perPersonHeating = heatingTotal / peopleInHousehold;

  const clothes = clothesPerYear * 25;
  const devices = devicesPerYear * 150;

  return Math.round(
    transportEmissions + flightEmissions + foodEmissions + perPersonHeating + clothes + devices
  );
};

export { calculateCO2 };
