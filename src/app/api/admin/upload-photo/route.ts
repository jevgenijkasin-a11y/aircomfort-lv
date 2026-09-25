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
  const typeError = uploadTypeError(bytes, file.name);
  if (typeError) return NextResponse.json({ error: typeError }, { status: 400 });
  // Portrait shown at 130 px — 800 px is plenty for retina and vCard use
  const { data, ext } = await optimizeUpload(bytes, sniffImageType(bytes), 800);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const dir = path.join(UPLOADS_DIR, 'employee-photos');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), data);

  return NextResponse.json({ url: `/uploads/employee-photos/${filename}` });
}
