import { notFound } from 'next/navigation';
import { Locale, hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';
import { routing } from '../../i18n/routing';
import MainNavbar from '@/components/global/MainNavbar';
import PseudonymDisplay from '@/components/global/PseudonymDisplay';
import ScoreHeader from '@/components/global/ScoreHeader';
import Footer from '@/components/global/footer/Footer';
import UserProvider from '@/components/global/UserProvider';
import { SITE_GITHUB, SITE_JOB_TITLE, SITE_LINKEDIN, SITE_NAME, SITE_URL } from '@/lib/site';
import styles from './layout.module.css';

// Resolve the theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

type Props = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: `%s · ${SITE_NAME}`,
    },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        fr: '/fr',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      images: [
        {
          url: '/images/opengraph-image.jpg',
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — portfolio`,
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/opengraph-image.jpg'],
    },
  };
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: SITE_JOB_TITLE,
  sameAs: [SITE_GITHUB, SITE_LINKEDIN],
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} key={locale} suppressHydrationWarning>
      {/* suppressHydrationWarning: the inline script below sets `data-theme` on
          <html> before hydration, and some browser extensions (e.g. ColorZilla
          adds `cz-shortcut-listen`) mutate <body> — both would otherwise trigger
          hydration mismatch warnings. */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <NextIntlClientProvider>
          <main>
            <UserProvider>
              <div className={styles.stickyHeader}>
                <MainNavbar />
                <div className={`${styles.scoreBar} no-print`}>
                  <PseudonymDisplay />
                  <ScoreHeader />
                </div>
              </div>
              <Suspense>{children}</Suspense>
            </UserProvider>
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
