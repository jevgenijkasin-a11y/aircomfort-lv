export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/jsonDb';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';

interface RequestEntry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

async function sendNotification(entry: RequestEntry) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.SMTP_TO || user;

  if (!host || !user || !pass) return;

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"AirComfort.lv" <${user}>`,
    to,
    subject: `Jauns pieprasījums no ${entry.name}`,
    html: `
      <h2>Jauns pieprasījums / Новая заявка</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;">
        <tr><td style="color:#666;padding:4px 12px 4px 0">Vārds / Имя:</td><td><b>${entry.name}</b></td></tr>
        <tr><td style="color:#666;padding:4px 12px 4px 0">Telefons / Телефон:</td><td><b>${entry.phone}</b></td></tr>
        ${entry.email ? `<tr><td style="color:#666;padding:4px 12px 4px 0">E-pasts / Email:</td><td>${entry.email}</td></tr>` : ''}
        ${entry.message ? `<tr><td style="color:#666;padding:4px 12px 4px 0">Ziņojums / Сообщение:</td><td>${entry.message}</td></tr>` : ''}
        <tr><td style="color:#666;padding:4px 12px 4px 0">Laiks / Время:</td><td>${new Date(entry.createdAt).toLocaleString('lv-LV')}</td></tr>
      </table>
      <p style="margin-top:16px;color:#888;font-size:12px;">AirComfort.lv</p>
    `,
  });
}

export async function POST(req: NextRequest) {
  const { name, phone, email, message } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
  }
  const entry: RequestEntry = {
    id: randomUUID(),
    name,
    phone,
    email: email || '',
    message: message || '',
    createdAt: new Date().toISOString(),
    read: false,
  };
  const requests = await readJson<RequestEntry[]>('requests.json');
  requests.push(entry);
  await writeJson('requests.json', requests);

  // Send email notification (non-blocking)
  sendNotification(entry).catch((err) => console.error('[SMTP]', err?.message || err));

  return NextResponse.json({ success: true });
}
