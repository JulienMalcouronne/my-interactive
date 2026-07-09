import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './footer.module.css';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const localisedResumeUrl = `/documents/${locale === 'fr' ? 'CV' : 'RESUME'}_JULIEN_MALCOURONNE.pdf`;

  return (
    <footer className={`${styles.footer} no-print`}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <p className={styles.title}>Julien Malcouronne</p>
          <p>{t('frontendDeveloper')}</p>
          <p className={styles.copyright}>© 2025 – {t('madeWith')} Next.js</p>
        </div>

        <div className={styles.column}>
          <p className={styles.title}>{t('navigation')}</p>
          <ul className={styles.links}>
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
              <Link href="/dog-walk">{t('dogWalk')}</Link>
            </li>

            <li>
              <Link href="/leaderboard">{t('leaderboard')}</Link>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <p className={styles.title}>{t('contact')}</p>
          <ul className={styles.links}>
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
              <a href={localisedResumeUrl} target="_blank">
                {t('downloadCv')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
