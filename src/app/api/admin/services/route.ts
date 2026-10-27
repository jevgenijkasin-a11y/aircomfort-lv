export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { listServices } from '@/lib/db';
import { servicePrice } from '@/lib/serviceData';

const unauth = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/** All services (drafts included) + the price each page shows now. */
export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return unauth();
  const services = listServices();
  const prices = await Promise.all(services.map(servicePrice));
  return NextResponse.json({ services, prices: Object.fromEntries(services.map((s, i) => [s.id, prices[i]])) });
}
