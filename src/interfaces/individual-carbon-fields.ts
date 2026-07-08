type TTransportMode = 'car' | 'bus' | 'metro' | 'train' | 'bike' | 'walk' | 'telework';
type TCarType = 'essence' | 'diesel' | 'electric';
type TMeatConsumption = 'high' | 'medium' | 'low' | 'none';
type THeating = 'gas' | 'electric' | 'fuel';

interface IIndividualCarbonFields {
  transportMode: TTransportMode;
  carType: TCarType;
  dailyCommuteKm: number;
  commuteDaysPerWeek: number;
  carpoolSize: number;
  shortFlightsPerYear: number;
  mediumFlightsPerYear: number;
  longFlightsPerYear: number;
  meatConsumption: TMeatConsumption;
  homeSize: number;
  heating: THeating;
  isWellInsulated: boolean;
  hasRenewableElectricity: boolean;
  peopleInHousehold: number;
  clothesPerYear: number;
  devicesPerYear: number;
}

type TCarbonCategory = 'transport' | 'flights' | 'food' | 'heating' | 'clothes' | 'devices';

type ICarbonBreakdown = Record<TCarbonCategory, number> & { total: number };

interface ICarbonInput {
  label: string;
  name: keyof IIndividualCarbonFields;
  type: 'number';
  min: number;
}

export type { IIndividualCarbonFields, ICarbonInput, ICarbonBreakdown, TCarbonCategory };
