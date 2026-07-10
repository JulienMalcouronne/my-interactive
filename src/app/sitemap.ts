import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { SITE_URL } from '@/lib/site';

// Public, indexable routes (the result page is excluded — it needs query data).
const ROUTES = [
  '/',
  '/earth',
  '/resume',
  '/individual-carbon-footprint',
  '/dog-walk',
  '/tennis',
  '/leaderboard',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((href) =>
    routing.locales.map((locale) => {
      const pathname = getPathname({ href, locale });
      return {
        url: new URL(pathname, SITE_URL).toString(),
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              new URL(getPathname({ href, locale: l }), SITE_URL).toString(),
            ])
          ),
        },
      };
    })
  );
}
