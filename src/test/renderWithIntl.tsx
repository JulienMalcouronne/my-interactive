import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import fr from '@/i18n/messages/fr.json';
import en from '@/i18n/messages/en.json';

const messagesByLocale = { fr, en } as const;

export const renderWithIntl = (ui: ReactNode, locale: keyof typeof messagesByLocale = 'fr') =>
  render(
    <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
      {ui}
    </NextIntlClientProvider>
  );
