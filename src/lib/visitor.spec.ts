import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  VISITOR_COOKIE,
  getCookieSecret,
  createVisitorId,
  signVisitorToken,
  verifyVisitorToken,
  readCookie,
  visitorIdFromCookie,
} from './visitor';

const SECRET = 'test-secret';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getCookieSecret', () => {
  test('uses the env secret when present', () => {
    vi.stubEnv('COOKIE_SECRET', 'from-env');
    expect(getCookieSecret()).toBe('from-env');
  });

  test('falls back to a dev secret when unset', () => {
    vi.stubEnv('COOKIE_SECRET', '');
    expect(getCookieSecret()).toBe('dev-insecure-secret-change-me');
  });
});

describe('createVisitorId', () => {
  test('returns a UUID', () => {
    expect(createVisitorId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });
});

describe('sign / verify', () => {
  test('a freshly signed token verifies back to the id', () => {
    const vid = 'abc-123';
    const token = signVisitorToken(vid, SECRET);
    expect(token.startsWith('abc-123.')).toBe(true);
    expect(verifyVisitorToken(token, SECRET)).toBe(vid);
  });

  test('rejects a token signed with a different secret', () => {
    const token = signVisitorToken('abc-123', SECRET);
    expect(verifyVisitorToken(token, 'other-secret')).toBeNull();
  });

  test('rejects a tampered id (signature no longer matches)', () => {
    const token = signVisitorToken('abc-123', SECRET);
    expect(verifyVisitorToken(`evil-${token}`, SECRET)).toBeNull();
  });

  test('rejects a truncated signature (length mismatch)', () => {
    const token = signVisitorToken('abc-123', SECRET);
    expect(verifyVisitorToken(token.slice(0, -4), SECRET)).toBeNull();
  });

  test('rejects empty and malformed tokens', () => {
    expect(verifyVisitorToken(null, SECRET)).toBeNull();
    expect(verifyVisitorToken('', SECRET)).toBeNull();
    expect(verifyVisitorToken('nodot', SECRET)).toBeNull();
    expect(verifyVisitorToken('.leadingdot', SECRET)).toBeNull();
  });
});

describe('readCookie', () => {
  test('reads a named cookie among several', () => {
    expect(readCookie('a=1; vid=xyz; b=2', 'vid')).toBe('xyz');
  });

  test('url-decodes the value', () => {
    expect(readCookie('vid=a%20b', 'vid')).toBe('a b');
  });

  test('returns null when absent or header empty', () => {
    expect(readCookie('a=1', 'vid')).toBeNull();
    expect(readCookie(null, 'vid')).toBeNull();
  });
});

describe('visitorIdFromCookie', () => {
  test('extracts and verifies the id from a Cookie header', () => {
    const token = signVisitorToken('visitor-1', SECRET);
    expect(visitorIdFromCookie(`${VISITOR_COOKIE}=${token}`, SECRET)).toBe('visitor-1');
  });

  test('returns null when the cookie is missing', () => {
    expect(visitorIdFromCookie('other=1', SECRET)).toBeNull();
  });
});
