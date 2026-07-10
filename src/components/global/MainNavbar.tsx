'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getLocalizedHref, SupportedLocale } from '@/lib/localizedRoutes';
import LanguageSwitcher from './LangSwitcher';
import styles from './MainNavbar.module.css';

const NAV_ITEMS = [
  { basePath: '/', label: 'home' },
  { basePath: '/earth', label: 'earth' },
  { basePath: '/individual-carbon-footprint', label: 'carbonFootprint' },
  { basePath: '/resume', label: 'cv' },
  { basePath: '/dog-walk', label: 'dogWalk' },
  { basePath: '/tennis', label: 'tennis' },
  { basePath: '/leaderboard', label: 'leaderboard', rightAlign: true },
] as const;

export default function MainNavbar() {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocale;
  const pathname = usePathname();

  const stripLocalePrefix = (path: string) => path.replace(/^\/(fr|en)/, '') || '/';
  const currentPath = stripLocalePrefix(pathname);

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <img className={styles.logo} src="/images/icon.png"></img>
      </Link>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const { basePath, label } = item;
          const rightAlign = 'rightAlign' in item ? item.rightAlign : false;
          const localizedHref = getLocalizedHref(basePath, locale);
          const normalizedHref = stripLocalePrefix(localizedHref);
          const isActive = currentPath === normalizedHref;

          return (
            <li key={basePath} className={rightAlign ? styles.rightAlign : ''}>
              <Link href={localizedHref} className={isActive ? styles.active : styles.link}>
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
      <LanguageSwitcher />
    </nav>
  );
}
