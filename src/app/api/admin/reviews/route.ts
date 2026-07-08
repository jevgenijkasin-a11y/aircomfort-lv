export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listReviews, createReview } from '@/lib/db';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(await listReviews());
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  await createReview(await req.json());
  return NextResponse.json({ success: true });
}
