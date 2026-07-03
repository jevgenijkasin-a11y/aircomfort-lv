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
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('employee-photos')
    .upload(filename, Buffer.from(bytes), {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('[upload-photo] Supabase Storage error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message, details: JSON.stringify(error) }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('employee-photos')
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
