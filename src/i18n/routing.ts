import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/leaderboard': { fr: '/classement' },
    '/earth': { fr: '/terre' },
    '/individual-carbon-footprint': { fr: '/empreinte-carbone-individuelle' },
    '/individual-footprint-result': { fr: '/resultat-empreinte-carbone' },
    '/dog-walk': { fr: '/promenade-chien' },
    '/tennis': { fr: '/tennis' },
    '/design-system': { fr: '/design-system' },
    '/about': { fr: '/a-propos' },
    '/contact': { fr: '/contact' },
    '/resume': { fr: '/cv' },
  },
});
