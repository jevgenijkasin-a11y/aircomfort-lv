export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
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
};

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
        <tr><td style="color:#666;padding:4px 12px 4px 0">Vārds / Имя:</td><td><b>${entry.name}</b></td></tr>
        <tr><td style="color:#666;padding:4px 12px 4px 0">Telefons / Телефон:</td><td><b>${entry.phone}</b></td></tr>
        ${entry.email ? `<tr><td style="color:#666;padding:4px 12px 4px 0">E-pasts / Email:</td><td>${entry.email}</td></tr>` : ''}
        ${entry.service ? `<tr><td style="color:#666;padding:4px 12px 4px 0">Pakalpojums / Услуга:</td><td>${SERVICE_LABELS[entry.service] ?? entry.service}</td></tr>` : ''}
        ${entry.message ? `<tr><td style="color:#666;padding:4px 12px 4px 0">Ziņojums / Сообщение:</td><td>${entry.message}</td></tr>` : ''}
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
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <div style="background:#072D47;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#27C4A0;margin:0;font-size:22px">AirComfort.lv</h1>
        </div>
        <div style="padding:28px 32px;background:#f9f9f9;border-radius:0 0 8px 8px">

          <p style="margin-top:0"><b>Latvian:</b><br>
          Paldies, <b>${entry.name}</b>! Jūsu pieprasījums ir saņemts. Mēs ar jums sazināsimies tuvākajā laikā.</p>

          <p><b>Русский:</b><br>
          Спасибо, <b>${entry.name}</b>! Ваша заявка получена. Мы свяжемся с вами в ближайшее время.</p>

          <p><b>English:</b><br>
          Thank you, <b>${entry.name}</b>! Your request has been received. We will contact you shortly.</p>

          <hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
          <p style="color:#888;font-size:12px;margin:0">
            Tel: +371 28828400 &nbsp;|&nbsp; Web: aircomfort.lv
          </p>
        </div>
      </div>
    `,
  });
  console.log('[SMTP] auto-reply sent to', entry.email);
}

export async function POST(req: NextRequest) {
  const { name, phone, email, service, message } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }
  const entry: RequestEntry = { name, phone, email: email || '', service: service || '', message: message || '' };

  // Save to Supabase contacts table (same as admin reads from)
  await supabaseServer.from('contacts').insert([{ ...entry, status: 'new' }]);

  // Send notification to admin + auto-reply to customer (non-blocking)
  sendNotification(entry).catch((err) => console.error('[SMTP notify]', err?.message || err));
  sendAutoReply(entry).catch((err) => console.error('[SMTP reply]', err?.message || err));

  return NextResponse.json({ success: true });
}
