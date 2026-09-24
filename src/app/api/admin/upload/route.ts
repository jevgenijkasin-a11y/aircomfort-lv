export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifySession } from '@/lib/adminAuth';
import { UPLOADS_DIR } from '@/lib/db';
import { optimizeUpload } from '@/lib/optimizeUpload';

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const rawSafeExt = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : 'jpg';
  // Shrink to ≤1920 px WebP so multi-MB camera/PNG exports aren't stored as-is
  const { data, ext } = await optimizeUpload(Buffer.from(bytes), rawSafeExt, 1920);
  const filename = `${Date.now()}.${ext}`;

  const dir = path.join(UPLOADS_DIR, 'products');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), data);

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}
