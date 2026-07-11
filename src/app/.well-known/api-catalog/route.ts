// RFC 9727 API catalog for automated API discovery.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? 'aircomfort.lv';
  const base = `${proto}://${host}`;

  const catalog = {
    linkset: [
      {
        anchor: `${base}/api`,
        'service-desc': [
          { href: `${base}/openapi.json`, type: 'application/vnd.oai.openapi+json;version=3.0' },
        ],
        'service-doc': [
          { href: `${base}/api-docs`, type: 'text/markdown' },
        ],
        status: [
          { href: `${base}/api/health` },
        ],
      },
    ],
  };

  return NextResponse.json(catalog, {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
