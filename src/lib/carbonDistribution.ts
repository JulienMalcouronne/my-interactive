export interface ICarbonDistributionBucket {
  label: string;
  count: number;
  isUser: boolean;
}

export interface ICarbonDistribution {
  buckets: ICarbonDistributionBucket[];
  betterThanPercent: number;
  participants: number;
}

// Incompressible public-services baseline shared by every resident (~1.5 t CO2e).
export const PUBLIC_SERVICES_KG = 1500;

const BUCKET_KG = 1000; // one tonne per bucket
const OVERFLOW_INDEX = 12; // last bucket groups everything >= 12 t

const bucketIndex = (kg: number) =>
  Math.min(Math.floor(Math.max(0, kg) / BUCKET_KG), OVERFLOW_INDEX);

/**
 * Buckets every participant's total (in kg CO2e) into one-tonne bands and locates
 * the current user among them. `betterThanPercent` is the share of participants
 * who emit *more* than the user.
 */
export function buildCarbonDistribution(
  totalsKg: number[],
  userTotalKg: number
): ICarbonDistribution {
  const userIndex = bucketIndex(userTotalKg);
  const counts = new Array<number>(OVERFLOW_INDEX + 1).fill(0);

  for (const total of totalsKg) {
    counts[bucketIndex(total)] += 1;
  }

  const buckets = counts.map((count, index) => ({
    label: index === OVERFLOW_INDEX ? `${OVERFLOW_INDEX}+` : `${index}–${index + 1}`,
    count,
    isUser: index === userIndex,
  }));

  const participants = totalsKg.length;
  const greater = totalsKg.filter((total) => total > userTotalKg).length;
  const betterThanPercent = participants > 0 ? Math.round((greater / participants) * 100) : 0;

  return { buckets, betterThanPercent, participants };
}
