export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listHeroSlides, createHeroSlide } from '@/lib/db';

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  return NextResponse.json(await listHeroSlides());
}

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const { image_url } = await req.json();
  if (!image_url) return NextResponse.json({ error: 'image_url required' }, { status: 400 });
  const slides = await listHeroSlides();
  const maxOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.sort_order)) : -1;
  await createHeroSlide(image_url, maxOrder + 1);
  return NextResponse.json({ success: true });
}
