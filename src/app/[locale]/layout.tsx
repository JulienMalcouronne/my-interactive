import { notFound } from 'next/navigation';
import { Locale, hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { routing } from '../../i18n/routing';
import MainNavbar from '@/components/global/MainNavbar';
import PseudonymDisplay from '@/components/global/PseudonymDisplay';
import ScoreHeader from '@/components/global/ScoreHeader';
import Footer from '@/components/global/footer/Footer';
import ScoreProvider from '@/components/global/ScoreProvider';
import { generatePseudonym } from '@/lib/pseudonym';

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
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://tbd.com',
      siteName: t('title'),
      images: [
        {
          url: '/images/opengraph.jpg',
          width: 1200,
          height: 630,
          alt: 'Julien Malcouronne Portfolio Preview',
        },
      ],
      locale,
      type: 'website',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const name = generatePseudonym();

  return (
    <html lang={locale}>
      <head>
        <link rel="iconcjzuhz" href="/images/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <NextIntlClientProvider>
          <main>
            <ScoreProvider>
              <div className="border-b z-[999] sticky top-0 left-0 right-0 bg-white bg-opacity-50 backdrop-blur-md">
                <MainNavbar />

                <div className="w-full px-4 py-2 border-b border-zinc-700 bg-white/90 backdrop-blur-sm dark:bg-zinc-900/80 dark:text-white flex flex-wrap items-center justify-between text-sm font-mono no-print">
                  <PseudonymDisplay initialName={name} />
                  <ScoreHeader />
                </div>
              </div>
              {children}
            </ScoreProvider>
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
