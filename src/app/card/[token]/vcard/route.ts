import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data } = await supabaseAdmin
    .from('employees_cards')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (!data) {
    return new Response('Not found', { status: 404 });
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `ORG:AirComfort`,
    `TITLE:${data.position}`,
    `TEL;TYPE=CELL:${data.phone}`,
    `EMAIL:${data.email}`,
    `URL:https://aircomfort.lv`,
    `ADR;TYPE=WORK:;;Rīga;;; ;Latvija`,
    data.photo_url ? `PHOTO;VALUE=URI:${data.photo_url}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');

  return new Response(lines, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${data.slug}.vcf"`,
    },
  });
}
