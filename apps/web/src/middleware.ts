import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const SESSION_COOKIE = 'catalog_session';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin locale routing dışında; UX için cookie yoksa login'e yönlendir.
  // Gerçek yetki kontrolü API'dedir.
  if (pathname.startsWith('/admin')) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
