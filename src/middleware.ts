import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // ── Addresses without a language (/catalog, /contacts…) ─────────────
  // Permanent 308 to the Latvian version. next-intl would answer 307 and
  // pick the language from cookie / Accept-Language, so the same URL
  // redirected differently per visitor. "/" is handled in next.config.js.
  const { pathname: path, search } = request.nextUrl;
  if (path !== '/' && !(routing.locales as readonly string[]).some((l) => path === `/${l}` || path.startsWith(`/${l}/`))) {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}${path}${search}`, request.url), 308);
  }

  // ── Markdown for Agents ─────────────────────────────────────────────
  // Requests with `Accept: text/markdown` get a markdown rendition of the
  // page (converted from the HTML response). Browsers keep getting HTML.
  const accept = request.headers.get('accept') || '';
  if (
    request.method === 'GET' &&
    accept.includes('text/markdown') &&
    !request.headers.get('x-md-internal')
  ) {
    const url = request.nextUrl.clone();
    const target = new URL('/api/md', request.url);
    target.searchParams.set('path', url.pathname + url.search);
    return NextResponse.rewrite(target);
  }

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
  // card/uploads are excluded so the intl middleware never rewrites or
  // redirects employee business-card and uploaded-file URLs.
  matcher: ['/', '/(lv|ru|en)/:path*', '/((?!_next|_vercel|admin|api|card|uploads|.*\\..*).*)'],
};
