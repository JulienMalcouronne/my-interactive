import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const fullPathname = request.nextUrl.pathname;

  const intlResponse = intlMiddleware(request);
  const response = new Response(intlResponse.body, intlResponse);

  response.headers.set('x-pathname', fullPathname);

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
