// Serves uploaded images from DATA_DIR/uploads (outside the git-deployed tree).
export const dynamic = 'force-dynamic';

import { promises as fs } from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '@/lib/db';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const rel = segments.join('/');
  if (rel.includes('..') || rel.includes('\0')) {
    return new Response('Bad request', { status: 400 });
  }

  const filePath = path.join(UPLOADS_DIR, rel);
  let buf: Buffer;
  try {
    buf = await fs.readFile(filePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const type = MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  // Filenames are timestamped and never rewritten, so cache aggressively
  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
