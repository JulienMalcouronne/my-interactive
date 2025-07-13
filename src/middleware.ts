import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const fullPathname = request.nextUrl.pathname;

  // Exécute intlMiddleware et clone la réponse
  const intlResponse = intlMiddleware(request);
  const response = new Response(intlResponse.body, intlResponse);

  // Ajoute x-pathname manuellement
  response.headers.set('x-pathname', fullPathname);

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
