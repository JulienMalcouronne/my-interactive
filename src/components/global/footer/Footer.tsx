import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="sticky bottom-0 bg-neutral-900 text-white text-sm px-6 py-3 no-print">
      <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between items-start gap-y-4">
        <div className="space-y-1">
          <p className="font-bold">Julien Malcouronne</p>
          <p>{t('frontendDeveloper')}</p>
          <p className="text-xs text-gray-400">© 2025 – {t('madeWith')} Next.js</p>
        </div>

        <div className="space-y-1">
          <p className="font-bold">{t('navigation')}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link href="/">{t('home')}</Link>
            </li>
            <li>
              <Link href="/earth">{t('earth')}</Link>
            </li>
            <li>
              <Link href="individual-carbon-footprint">{t('carbonFootprint')}</Link>
            </li>
            <li>
              <Link href="/resume">{t('cv')}</Link>
            </li>

            <li>
              <Link href="/leaderboard">{t('leaderboard')}</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <p className="font-bold">{t('contact')}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link href="mailto:malcouronnejulien@gmail.com">{t('email')}</Link>
            </li>
            <li>
              <Link href="https://github.com/JulienMalcouronne" target="_blank">
                GitHub
              </Link>
            </li>
            <li>
              <Link href="https://www.linkedin.com/in/julien-malcouronne/" target="_blank">
                LinkedIn
              </Link>
            </li>
            <li>
              <Link href="/documents/CV_MALCOURONNE_JULIEN.pdf" target="_blank">
                {t('downloadCv')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
