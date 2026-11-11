export const dynamic = 'force-dynamic';

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Revalidate every locale root and all nested pages under each
  for (const locale of ['lv', 'ru', 'en']) {
    revalidatePath(`/${locale}`, 'layout');
  }
  // Also revalidate root to cover any redirect/middleware paths
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true });
}
