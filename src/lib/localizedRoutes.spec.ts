import { expect, test } from 'vitest';
import { getLocalizedHref, localizedRoutes } from './localizedRoutes';

test('English hrefs are returned without a locale prefix', () => {
  expect(getLocalizedHref('/', 'en')).toBe('/');
  expect(getLocalizedHref('/leaderboard', 'en')).toBe('/leaderboard');
  expect(getLocalizedHref('/earth', 'en')).toBe('/earth');
});

test('French hrefs are prefixed with the locale and use the localized path', () => {
  expect(getLocalizedHref('/', 'fr')).toBe('/fr/');
  expect(getLocalizedHref('/leaderboard', 'fr')).toBe('/fr/classement');
  expect(getLocalizedHref('/individual-carbon-footprint', 'fr')).toBe(
    '/fr/empreinte-carbone-individuelle'
  );
});

test('exposes the route map', () => {
  expect(localizedRoutes['/resume']).toEqual({ fr: '/cv', en: '/resume' });
});
