import { describe, expect, test } from 'vitest';
import { rateLimit } from './rateLimit';

describe('rateLimit', () => {
  test('allows the first hit and opens a window', () => {
    expect(rateLimit('a', 2, 1000, 0)).toEqual({ allowed: true, remaining: 1 });
  });

  test('allows further hits under the limit', () => {
    expect(rateLimit('a', 2, 1000, 100)).toEqual({ allowed: true, remaining: 0 });
  });

  test('blocks once the limit is reached within the window', () => {
    expect(rateLimit('a', 2, 1000, 200)).toEqual({ allowed: false, remaining: 0 });
  });

  test('resets after the window elapses', () => {
    expect(rateLimit('a', 2, 1000, 1000)).toEqual({ allowed: true, remaining: 1 });
  });

  test('tracks keys independently and defaults now to Date.now()', () => {
    expect(rateLimit('b', 5, 1000)).toEqual({ allowed: true, remaining: 4 });
  });
});
