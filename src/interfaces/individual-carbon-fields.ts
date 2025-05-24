interface IIndividualCarbonFields {
  carKmPerWeek: number;
  carType: "essence" | "electric" | "diesel";
  shortFlightsPerYear: number;
  longFlightsPerYear: number;
  meatConsumption: "medium" | "high" | "low" | "none";
  homeSize: number;
  heating: "gas";
  isWellInsulated: boolean;
  peopleInHousehold: number;
  clothesPerYear: number;
  devicesPerYear: number;
}

interface ICarbonInput {
    label: string;
    name: keyof IIndividualCarbonFields;
    type: "number";
    min: number;
}

export type { IIndividualCarbonFields, ICarbonInput };
