import { getCardByToken } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const data = await getCardByToken(token);

  if (!data) {
    return new Response('Not found', { status: 404 });
  }

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `ORG:AirComfort`,
    `TITLE:${data.title}`,
    `TEL;TYPE=CELL:${data.phone}`,
    `EMAIL:${data.email}`,
    `URL:https://aircomfort.lv`,
    data.photo_url ? `PHOTO;VALUE=URI:${data.photo_url.startsWith('/') ? `https://aircomfort.lv${data.photo_url}` : data.photo_url}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');

  return new Response(lines, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${data.slug}.vcf"`,
    },
  });
}
