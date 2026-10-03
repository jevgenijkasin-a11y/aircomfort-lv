export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createContact, getProduct, hiddenCategoryKeys } from '@/lib/db';
import { fullName, finalPrice } from '@/lib/productSeo';
import { BASE_URL } from '@/lib/seo';
import type { ContactProduct } from '@/lib/types';
import nodemailer from 'nodemailer';

interface RequestEntry {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

const SERVICE_LABELS: Record<string, string> = {
  install: 'Uzstādīšana / Установка',
  maintenance: 'Apkope / Обслуживание',
  consultation: 'Konsultācija / Консультация',
  other: 'Cits / Другое',
  catalog_order: 'Pasūtījums no kataloga / Заказ из каталога',
  favorites: 'Izlase / Подборка из избранного',
};

/** Values from the form go into the notification e-mail as text, not HTML. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function createTransport(forExternal = false) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const configs: nodemailer.TransportOptions[] = [];

  // Configured external SMTP host (if set)
  if (host && user && pass) {
    const port = Number(process.env.SMTP_PORT || 465);
    configs.push({ host, port, secure: port === 465, auth: { user, pass }, tls: { rejectUnauthorized: false } } as nodemailer.TransportOptions);
    if (port === 465) configs.push({ host, port: 587, secure: false, auth: { user, pass }, tls: { rejectUnauthorized: false } } as nodemailer.TransportOptions);
  }

  // Try localhost with auth on submission ports (Plesk SMTP)
  if (user && pass) {
    configs.push({ host: 'localhost', port: 587, secure: false, auth: { user, pass }, tls: { rejectUnauthorized: false } } as nodemailer.TransportOptions);
    configs.push({ host: 'localhost', port: 465, secure: true, auth: { user, pass }, tls: { rejectUnauthorized: false } } as nodemailer.TransportOptions);
  }

  // Postfix no-auth relay — works for local delivery, may not relay external
  if (!forExternal) {
    configs.push({ host: 'localhost', port: 25, secure: false, tls: { rejectUnauthorized: false } } as nodemailer.TransportOptions);
  } else {
    // For external: try localhost:25 last (may work if Postfix relays outbound)
    configs.push({ host: 'localhost', port: 25, secure: false, tls: { rejectUnauthorized: false } } as nodemailer.TransportOptions);
  }

  for (const config of configs) {
    try {
      const t = nodemailer.createTransport(config);
      await t.verify();
      console.log('[SMTP] connected via', JSON.stringify({ host: (config as Record<string, unknown>).host, port: (config as Record<string, unknown>).port }));
      return t;
    } catch (err) {
      console.log('[SMTP] skipped', JSON.stringify({ host: (config as Record<string, unknown>).host, port: (config as Record<string, unknown>).port }), (err as Error)?.message);
    }
  }
  return null;
}

async function sendNotification(entry: RequestEntry) {
  const user = process.env.SMTP_USER || 'info@aircomfort.lv';
  const to = process.env.SMTP_TO || user;
  if (!to) return;

  const t = await createTransport();
  if (!t) { console.error('[SMTP] no working transport'); return; }

  await t.sendMail({
    from: `"AirComfort.lv" <${user}>`,
    to,
    subject: `Jauns pieprasījums no ${entry.name}`,
    html: `
      <h2>Jauns pieprasījums / Новая заявка</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;">
        <tr><td style="color:#666;padding:4px 12px 4px 0">Vārds / Имя:</td><td><b>${esc(entry.name)}</b></td></tr>
        <tr><td style="color:#666;padding:4px 12px 4px 0">Telefons / Телефон:</td><td><b>${esc(entry.phone)}</b></td></tr>
        ${entry.email ? `<tr><td style="color:#666;padding:4px 12px 4px 0">E-pasts / Email:</td><td>${esc(entry.email)}</td></tr>` : ''}
        ${entry.service ? `<tr><td style="color:#666;padding:4px 12px 4px 0">Pakalpojums / Услуга:</td><td>${esc(SERVICE_LABELS[entry.service] ?? entry.service)}</td></tr>` : ''}
        ${entry.message ? `<tr><td style="color:#666;padding:4px 12px 4px 0">Ziņojums / Сообщение:</td><td style="white-space:pre-wrap">${esc(entry.message)}</td></tr>` : ''}
        <tr><td style="color:#666;padding:4px 12px 4px 0">Laiks / Время:</td><td>${new Date().toLocaleString('lv-LV')}</td></tr>
      </table>
      <p style="margin-top:16px;color:#888;font-size:12px;">AirComfort.lv</p>
    `,
  });
  console.log('[SMTP] notification sent to', to);
}

async function sendAutoReply(entry: RequestEntry) {
  if (!entry.email) return;
  const user = process.env.SMTP_USER || 'info@aircomfort.lv';

  const t = await createTransport(true);
  if (!t) { console.error('[SMTP] no transport for auto-reply'); return; }

  await t.sendMail({
    from: `"AirComfort.lv" <${user}>`,
    to: entry.email,
    subject: 'Paldies par pieprasījumu / Спасибо за заявку / Thank you',
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#27C4A0,#1A6B9A);padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">AirComfort.lv</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Klimatiekārtu piegāde un uzstādīšana</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 6px;color:#27C4A0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Latviešu</p>
    <p style="margin:0 0 6px;color:#333;font-size:15px;line-height:1.6;">
      Paldies par Jūsu ziņojumu! Mēs to esam saņēmuši un tuvākajā laikā ar Jums sazināsimies.
    </p>
    <p style="margin:0 0 24px;color:#1A6B9A;font-size:14px;font-weight:600;">Ar cieņu, AirComfort.lv</p>
    <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
    <p style="margin:0 0 6px;color:#27C4A0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Русский</p>
    <p style="margin:0 0 6px;color:#333;font-size:15px;line-height:1.6;">
      Спасибо за ваше письмо! Мы его получили и свяжемся с вами в ближайшее время.
    </p>
    <p style="margin:0 0 24px;color:#1A6B9A;font-size:14px;font-weight:600;">С уважением, AirComfort.lv</p>
    <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
    <p style="margin:0 0 6px;color:#27C4A0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">English</p>
    <p style="margin:0 0 6px;color:#333;font-size:15px;line-height:1.6;">
      Thank you for your message! We have received it and will get back to you shortly.
    </p>
    <p style="margin:0 0 28px;color:#1A6B9A;font-size:14px;font-weight:600;">Best regards, AirComfort.lv</p>
    <div style="background:#f0faf7;border-left:4px solid #27C4A0;padding:14px 18px;border-radius:0 8px 8px 0;">
      <p style="margin:0;color:#1A6B9A;font-size:14px;">Tel: +371 28828400</p>
      <p style="margin:4px 0 0;color:#1A6B9A;font-size:14px;">Web: aircomfort.lv</p>
      <p style="margin:4px 0 0;color:#999;font-size:12px;">P-Pt / Пн–Пт / Mon-Fri 9:00-18:00</p>
    </div>
  </div>
</div>
</body>
</html>`,
  });
  console.log('[SMTP] auto-reply sent to', entry.email);
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/**
 * Catalog order / favorites selection: product names and prices are taken
 * from the database (never from the browser); only public, in-stock
 * products are accepted.
 */
async function requestProducts(ids: unknown): Promise<ContactProduct[]> {
  if (!Array.isArray(ids)) return [];
  const unique = Array.from(new Set(ids.map(String))).slice(0, 50);
  const hidden = hiddenCategoryKeys();
  const out: ContactProduct[] = [];
  for (const id of unique) {
    const p = await getProduct(id);
    if (!p || !p.in_stock || hidden.has(p.category)) continue;
    out.push({ id: p.id, name: fullName(p, 'ru'), price: finalPrice(p) ?? 0 });
  }
  return out;
}

function orderMessage(service: string, products: ContactProduct[], install: boolean | null, comment: string, locale: string): string {
  const lines: string[] = [];
  lines.push(service === 'catalog_order' ? 'Заказ из каталога' : 'Подборка из избранного');
  for (const p of products) lines.push(`• ${p.name} — ${p.price ? `${p.price} €` : 'цена по запросу'}\n  ${BASE_URL}/${locale}/catalog/${p.id}`);
  if (install !== null) lines.push(`Монтаж: ${install ? 'нужен' : 'не нужен'}`);
  if (comment) lines.push('', `Комментарий: ${comment}`);
  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  // "+371 " alone is the prefilled prefix, not a number
  if (!name || phone.replace(/\D/g, '').length < 6) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }
  const service = str(body.service, 40);
  let message = str(body.message, 4000);
  let products: ContactProduct[] = [];
  let install: boolean | null = null;
  if (service === 'catalog_order' || service === 'favorites') {
    products = await requestProducts(body.product_ids);
    if (!products.length) return NextResponse.json({ error: 'No products' }, { status: 400 });
    install = service === 'catalog_order' ? body.install !== false : null;
    const locale = ['lv', 'ru', 'en'].includes(body.locale) ? body.locale : 'lv';
    message = orderMessage(service, products, install, message, locale);
  }
  const entry: RequestEntry = { name, phone, email: str(body.email, 200), service, message };

  // Save to contacts table (same as admin reads from)
  await createContact({ ...entry, products, install });

  // Send notification to admin + auto-reply to customer (non-blocking)
  sendNotification(entry).catch((err) => console.error('[SMTP notify]', err?.message || err));
  sendAutoReply(entry).catch((err) => console.error('[SMTP reply]', err?.message || err));

  return NextResponse.json({ success: true });
}
