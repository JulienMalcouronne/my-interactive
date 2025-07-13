import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  //   pathnames: {
  //     '/': '/',
  //     '/leaderboard': '/classement',
  //     '/earth': '/terre',
  //     '/individual-carbon-footprint': '/empreinte-carbone-individuelle',
  //     '/about': '/a-propos',
  //     '/contact': '/contact',
  //   }
});
