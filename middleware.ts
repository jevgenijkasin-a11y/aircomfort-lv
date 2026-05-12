import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Pass redirects through unchanged
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // Extract locale from URL path and always inject it as a request header
  // so server components receive it regardless of whether createMiddleware did a rewrite
  const { pathname } = request.nextUrl;
  const locale = (routing.locales as readonly string[]).find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  ) ?? routing.defaultLocale;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);

  const next = NextResponse.next({ request: { headers: requestHeaders } });

  // Preserve Set-Cookie headers from the i18n middleware (locale cookie etc.)
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      next.headers.append('set-cookie', value);
    }
  });

  return next;
}

export const config = {
  matcher: ['/', '/(lv|ru|en)/:path*', '/((?!_next|_vercel|admin|api|.*\\..*).*)'],
};
