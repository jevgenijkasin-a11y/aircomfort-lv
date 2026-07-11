// Markdown for Agents: middleware rewrites page requests carrying
// `Accept: text/markdown` to this route, which fetches the page's own HTML
// and returns a markdown rendition (Content-Type: text/markdown).
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});
turndown.remove(['script', 'style', 'noscript', 'iframe']);

function extractBody(html: string): { title: string; body: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0];
  const body = main ?? html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  // Drop inline SVG icons — they convert to noise
  return { title, body: body.replace(/<svg[\s\S]*?<\/svg>/gi, '') };
}

export async function GET(req: NextRequest) {
  // With a middleware rewrite the handler still sees the ORIGINAL request
  // URL (the page path) — use it directly. The ?path= query only applies
  // when this route is called directly as /api/md.
  const nx = req.nextUrl;
  const path = nx.pathname.startsWith('/api/md')
    ? nx.searchParams.get('path') || '/'
    : nx.pathname + nx.search;
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Bad request', { status: 400 });
  }

  const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  const host = req.headers.get('host');
  if (!host) return new Response('Bad request', { status: 400 });

  const pageUrl = `${proto}://${host}${path}`;
  let html: string;
  try {
    const res = await fetch(pageUrl, {
      headers: { accept: 'text/html', 'x-md-internal': '1' },
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) return new Response('Not found', { status: res.status });
    html = await res.text();
  } catch {
    return new Response('Upstream error', { status: 502 });
  }

  const { title, body } = extractBody(html);
  let md = turndown.turndown(body)
    .replace(/^!\[\]\([^)]*\)\s*$/gm, '') // images without alt text are noise
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (title && !md.startsWith('#')) md = `# ${title}\n\n${md}`;

  // Rough token estimate (~4 chars per token)
  const tokens = Math.ceil(md.length / 4);

  return new Response(md + '\n', {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(tokens),
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
