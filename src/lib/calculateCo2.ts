import type { IIndividualCarbonFields, ICarbonBreakdown } from '@/interfaces';

const calculateCO2 = (form: IIndividualCarbonFields): ICarbonBreakdown => {
  const {
    transportMode,
    carType,
    dailyCommuteKm,
    commuteDaysPerWeek,
    carpoolSize,
    shortFlightsPerYear,
    mediumFlightsPerYear,
    longFlightsPerYear,
    meatConsumption,
    homeSize,
    heating,
    isWellInsulated,
    hasRenewableElectricity,
    peopleInHousehold,
    clothesPerYear,
    devicesPerYear,
  } = form;

  // Renewable electricity roughly cuts the footprint of electricity-based uses.
  const RENEWABLE_COEFFICIENT = 0.3;
  const electricity = (factor: number) =>
    hasRenewableElectricity ? factor * RENEWABLE_COEFFICIENT : factor;

  const carEmissionFactors: Record<string, number> = {
    essence: 0.192,
    diesel: 0.171,
    electric: electricity(0.015),
  };

  const heatingFactors: Record<string, number> = {
    gas: 0.198,
    electric: electricity(0.06),
    fuel: 0.27,
  };

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
  };

  const WORKING_WEEKS_PER_YEAR = 44; // 44 * 5 days = the 220 working-day baseline
  const COMMUTE_BOTH_WAY = 2;

  const SHORT_FLIGHT_CO2 = 300;
  const MEDIUM_FLIGHT_CO2 = 700;
  const LONG_FLIGHT_CO2 = 1500;

  const WELL_INSULATION_COEFFICIENT = 0.8;
  const LOW_INSULATION_COEFFICIENT = 1;

  const AVERAGE_CLOTHES_CO2 = 25;
  const AVERAGE_DEVICE_CO2 = 150;

  const effectiveCommuteDays = WORKING_WEEKS_PER_YEAR * commuteDaysPerWeek;
  // Carpooling only splits emissions when actually driving a car.
  const occupancy = transportMode === 'car' ? Math.max(1, carpoolSize) : 1;

  const transport =
    (dailyCommuteKm *
      COMMUTE_BOTH_WAY *
      effectiveCommuteDays *
      (transportFactors[transportMode] ?? 0)) /
    occupancy;

  const flights =
    shortFlightsPerYear * SHORT_FLIGHT_CO2 +
    mediumFlightsPerYear * MEDIUM_FLIGHT_CO2 +
    longFlightsPerYear * LONG_FLIGHT_CO2;

  const food = meatFactors[meatConsumption] ?? 0;

  const heatingTotal =
    homeSize *
    (heatingFactors[heating] ?? 0) *
    (isWellInsulated ? WELL_INSULATION_COEFFICIENT : LOW_INSULATION_COEFFICIENT);
  const heatingPerPerson = heatingTotal / peopleInHousehold;

  const clothes = clothesPerYear * AVERAGE_CLOTHES_CO2;
  const devices = devicesPerYear * AVERAGE_DEVICE_CO2;

  const breakdown = {
    transport: Math.round(transport),
    flights: Math.round(flights),
    food: Math.round(food),
    heating: Math.round(heatingPerPerson),
    clothes: Math.round(clothes),
    devices: Math.round(devices),
  };

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return { ...breakdown, total };
};

export { calculateCO2 };
