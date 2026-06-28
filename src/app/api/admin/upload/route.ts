export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!(await verifySession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const filename = `${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('products')
    .upload(filename, Buffer.from(bytes), {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('[upload] Supabase Storage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
