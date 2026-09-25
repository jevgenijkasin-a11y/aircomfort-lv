export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifySession } from '@/lib/adminAuth';
import { UPLOADS_DIR } from '@/lib/db';
import { optimizeUpload } from '@/lib/optimizeUpload';
import { sniffImageType, uploadTypeError } from '@/lib/imageType';

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // Trust the content, not the file name: rejects SVG/HTML renamed to .jpg
  const typeError = uploadTypeError(bytes, file.name);
  if (typeError) return NextResponse.json({ error: typeError }, { status: 400 });
  // Shrink to ≤1920 px WebP so multi-MB camera/PNG exports aren't stored as-is
  const { data, ext } = await optimizeUpload(bytes, sniffImageType(bytes), 1920);
  // Random suffix: two uploads in the same millisecond must not overwrite each other
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const dir = path.join(UPLOADS_DIR, 'products');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), data);

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}
