export const dynamic = 'force-dynamic';

// Read-only dashboard data for /admin-v2 (new route; reuses existing DB
// helpers and the upload type check — nothing in the old admin changes).
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifySession } from '@/lib/adminAuth';
import { listContacts, listProducts, UPLOADS_DIR } from '@/lib/db';
import { sniffImageType, RASTER_TYPES } from '@/lib/imageType';
import { productImageUrls } from '@/lib/adminShared';

const TZ = 'Europe/Riga';
const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

/** 'missing' | 'broken' | null for one stored image URL. */
async function imageProblem(url: string): Promise<'missing' | 'broken' | null> {
  if (!url.startsWith('/uploads/')) return null; // external URL: not checked
  const rel = decodeURIComponent(url.slice('/uploads/'.length));
  const file = path.join(UPLOADS_DIR, rel);
  if (!file.startsWith(UPLOADS_DIR)) return 'broken';
  try {
    const fh = await fs.open(file, 'r');
    const buf = Buffer.alloc(512);
    await fh.read(buf, 0, 512, 0);
    await fh.close();
    return RASTER_TYPES.includes(sniffImageType(buf)) ? null : 'broken';
  } catch {
    return 'missing';
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifySession(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [contacts, products] = await Promise.all([listContacts(), listProducts()]);

  // Requests per Riga calendar day, last 30 days (oldest first)
  const now = new Date();
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) days.push(dayKey(new Date(now.getTime() - i * 86_400_000)));
  const perDay = new Map(days.map((d) => [d, 0]));
  for (const c of contacts) {
    const k = dayKey(new Date(c.created_at));
    if (perDay.has(k)) perDay.set(k, perDay.get(k)! + 1);
  }
  const today = days[days.length - 1];
  const count = (n: number) => days.slice(-n).reduce((s, d) => s + perDay.get(d)!, 0);

  // Photo problems: no photo at all, or a first/any gallery file that is missing or not an image
  const issues: { id: string; name: string; brand: string; reason: 'noPhoto' | 'broken' }[] = [];
  let noPhoto = 0;
  for (const p of products) {
    const imgs = productImageUrls(p.image_url);
    if (!imgs.length) { noPhoto++; issues.push({ id: p.id, name: p.name_ru || p.name_en, brand: p.brand, reason: 'noPhoto' }); continue; }
    const probs = await Promise.all(imgs.map(imageProblem));
    if (probs.some(Boolean)) issues.push({ id: p.id, name: p.name_ru || p.name_en, brand: p.brand, reason: 'broken' });
  }

  return NextResponse.json({
    requests: {
      today: perDay.get(today) ?? 0,
      last7: count(7),
      last30: count(30),
      unread: contacts.filter((c) => c.status === 'new').length,
      perDay: days.map((d) => ({ date: d, count: perDay.get(d)! })),
      recent: contacts.slice(0, 5),
    },
    products: { total: products.length, noPhoto, issues },
  });
}
