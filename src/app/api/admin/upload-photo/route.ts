export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifySession } from '@/lib/adminAuth';
import { UPLOADS_DIR } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const dir = path.join(UPLOADS_DIR, 'employee-photos');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/employee-photos/${filename}` });
}
