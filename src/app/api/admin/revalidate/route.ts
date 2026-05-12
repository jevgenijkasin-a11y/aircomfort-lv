import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  // Revalidate every locale root and all nested pages under each
  for (const locale of ['lv', 'ru', 'en']) {
    revalidatePath(`/${locale}`, 'layout');
  }
  // Also revalidate root to cover any redirect/middleware paths
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true });
}
