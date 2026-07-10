// Anonymous visitor identity via a signed httpOnly cookie — no login required.
// A random UUID is minted per visitor and HMAC-signed so it cannot be forged
// or swapped for someone else's id. Kept out of the `@/lib` barrel on purpose:
// it imports `node:crypto`, which must never reach the client bundle.

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const VISITOR_COOKIE = 'vid';

export function getCookieSecret(): string {
  return process.env.COOKIE_SECRET || 'dev-insecure-secret-change-me';
}

export function createVisitorId(): string {
  return randomUUID();
}

export function signVisitorToken(vid: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(vid).digest('base64url');
  return `${vid}.${signature}`;
}

export function verifyVisitorToken(
  token: string | null | undefined,
  secret: string
): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const vid = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(vid).digest('base64url');

  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length) return null;
  return timingSafeEqual(given, wanted) ? vid : null;
}

export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

// Extract a verified visitor id straight from a Cookie header (or null).
export function visitorIdFromCookie(
  cookieHeader: string | null | undefined,
  secret: string
): string | null {
  return verifyVisitorToken(readCookie(cookieHeader, VISITOR_COOKIE), secret);
}
