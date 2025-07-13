'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocalizedHref, SupportedLocale } from '@/lib/localizedRoutes';

const NAV_ITEMS = [
  { basePath: '/', label: 'home' },
  { basePath: '/earth', label: 'earth' },
  { basePath: '/individual-carbon-footprint', label: 'carbonFootprint' },
  { basePath: '/resume', label: 'cv' },
  { basePath: '/leaderboard', label: 'leaderboard', rightAlign: true },
] as const;

export default function MainNavbar() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const pathname = usePathname();

  const stripLocalePrefix = (path: string) => path.replace(/^\/(fr|en|es|sv)/, '') || '/';
  const currentPath = stripLocalePrefix(pathname);

  return (
    <nav className="gap-4 p-4 bg-black">
      <ul className="flex gap-4 w-full">
        {NAV_ITEMS.map((item) => {
          const { basePath, label } = item;
          const rightAlign = 'rightAlign' in item ? item.rightAlign : false;
          const localizedHref = getLocalizedHref(basePath, locale);
          const normalizedHref = stripLocalePrefix(localizedHref);
          const isActive = currentPath === normalizedHref;

          return (
            <li key={basePath} className={rightAlign ? 'flex-1 text-right' : ''}>
              <Link
                href={localizedHref}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
