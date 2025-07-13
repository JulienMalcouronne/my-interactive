const localizedRoutes = {
  '/': { fr: '/', en: '/' },
  '/leaderboard': { fr: '/classement', en: '/leaderboard' },
  '/earth': { fr: '/terre', en: '/earth' },
  '/individual-carbon-footprint': {
    fr: '/empreinte-carbone-individuelle',
    en: '/individual-carbon-footprint',
  },
  '/resume': { fr: '/cv', en: '/resume' },
} as const;

type BasePath = keyof typeof localizedRoutes;
type SupportedLocale = keyof (typeof localizedRoutes)['/'];

function getLocalizedHref(basePath: BasePath, locale: SupportedLocale): string {
  const localizedPath = localizedRoutes[basePath][locale];
  return locale === 'en' ? localizedPath : `/${locale}${localizedPath}`;
}

export type { SupportedLocale, BasePath };

export { getLocalizedHref, localizedRoutes };
