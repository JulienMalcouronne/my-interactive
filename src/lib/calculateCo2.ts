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

  const EFFECTIVE_WORKING_DAY = 220;
  const COMMUTE_BOTH_WAY = 2;

  const SHORT_FLIGHT_CO2 = 300;
  const LONG_FLIGHT_CO2 = 1500;

  const WELL_INSULATION_COEFFICIENT = 0.8;
  const LOW_INSULATION_COEFFICIENT = 1;

  const AVERAGE_CLOTHES_CO2 = 25;
  const AVERAGE_DEVICE_CO2 = 150;

  const transportEmissions =
    dailyCommuteKm *
    COMMUTE_BOTH_WAY *
    EFFECTIVE_WORKING_DAY *
    (transportFactors[transportMode] ?? 0);

  const flightEmissions =
    shortFlightsPerYear * SHORT_FLIGHT_CO2 + longFlightsPerYear * LONG_FLIGHT_CO2;

  const foodEmissions = meatFactors[meatConsumption] ?? 0;

  const heatingTotal =
    homeSize *
    (heatingFactors[heating] ?? 0) *
    (isWellInsulated ? WELL_INSULATION_COEFFICIENT : LOW_INSULATION_COEFFICIENT);
  const perPersonHeating = heatingTotal / peopleInHousehold;

  const clothes = clothesPerYear * AVERAGE_CLOTHES_CO2;
  const devices = devicesPerYear * AVERAGE_DEVICE_CO2;

  return Math.round(
    transportEmissions + flightEmissions + foodEmissions + perPersonHeating + clothes + devices
  );
};

export { calculateCO2 };
