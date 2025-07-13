import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function MainNavbar() {
  const t = useTranslations();

  return (
    <nav className="gap-4 p-4 bg-black">
      <ul className="flex gap-4">
        <li>
          <Link href="/">{t('home')}</Link>
        </li>
        <li>
          <Link href="/earth">{t('earth')}</Link>
        </li>
        <li>
          <Link href="/individual-carbon-footprint">{t('carbonFootprint')}</Link>
        </li>
        <li>
          <Link href="/resume">{t('cv')}</Link>
        </li>
        <li className="flex-1 text-right">
          <Link href="/leaderboard">{t('leaderboard')}</Link>
        </li>
      </ul>
    </nav>
  );
}
