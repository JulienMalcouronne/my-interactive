import { expect, test, describe } from 'vitest';
import { buildCarbonDistribution } from './carbonDistribution';

describe('buildCarbonDistribution', () => {
  test('returns 13 one-tonne buckets (0–1 … 12+)', () => {
    const { buckets } = buildCarbonDistribution([], 0);
    expect(buckets).toHaveLength(13);
    expect(buckets[0].label).toBe('0–1');
    expect(buckets[11].label).toBe('11–12');
    expect(buckets[12].label).toBe('12+');
  });

  test('counts participants into the right bucket and flags the user bucket', () => {
    // 0.5t, 1.5t, 1.9t, 3.2t ; user at 1.5t -> bucket index 1
    const { buckets, participants } = buildCarbonDistribution([500, 1500, 1900, 3200], 1500);

    expect(participants).toBe(4);
    expect(buckets[0].count).toBe(1); // 500
    expect(buckets[1].count).toBe(2); // 1500, 1900
    expect(buckets[3].count).toBe(1); // 3200
    expect(buckets[1].isUser).toBe(true);
    expect(buckets.filter((b) => b.isUser)).toHaveLength(1);
  });

  test('groups anything >= 12 t into the overflow bucket', () => {
    const { buckets } = buildCarbonDistribution([12000, 20000], 15000);
    expect(buckets[12].count).toBe(2);
    expect(buckets[12].isUser).toBe(true);
  });

  test('betterThanPercent is the share of participants emitting more than the user', () => {
    // user 2000 ; three others: 1000 (less), 3000 (more), 5000 (more) -> 2/4 = 50%
    const { betterThanPercent } = buildCarbonDistribution([2000, 1000, 3000, 5000], 2000);
    expect(betterThanPercent).toBe(50);
  });

  test('handles an empty participant set', () => {
    const { participants, betterThanPercent, buckets } = buildCarbonDistribution([], 2000);
    expect(participants).toBe(0);
    expect(betterThanPercent).toBe(0);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });

  test('clamps negative totals into the first bucket', () => {
    const { buckets } = buildCarbonDistribution([-500], -100);
    expect(buckets[0].count).toBe(1);
    expect(buckets[0].isUser).toBe(true);
  });
});
