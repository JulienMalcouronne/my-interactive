import { afterEach, expect, test, vi } from 'vitest';
import { generatePseudonym } from './pseudonym';

afterEach(() => {
  vi.restoreAllMocks();
});

test('builds a pseudonym from an adjective, a noun and a two-digit number', () => {
  // 0 -> first adjective (Silver) & first noun (Fox) ; num = floor(0 * 90) + 10 = 10
  vi.spyOn(Math, 'random').mockReturnValue(0);
  expect(generatePseudonym()).toBe('SilverFox10');
});

test('picks other entries and offsets the number by 10', () => {
  // 0.999... -> last adjective (Whispering) & last noun (Specter) ; num = floor(0.999*90)+10 = 99
  vi.spyOn(Math, 'random').mockReturnValue(0.999999);
  expect(generatePseudonym()).toBe('WhisperingSpecter99');
});

test('always matches the Adjective+Noun+NN shape', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  expect(generatePseudonym()).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
});
