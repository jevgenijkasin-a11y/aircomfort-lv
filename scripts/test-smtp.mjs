import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'mail.aircomfort.lv';
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER || 'info@aircomfort.lv';
const pass = process.env.SMTP_PASS || '';
const to = process.env.SMTP_TO || user;

const configs = [
  {
    label: `${host}:${port} SSL`,
    config: { host, port, secure: port === 465, auth: { user, pass }, tls: { rejectUnauthorized: false } },
  },
  {
    label: `${host}:587 STARTTLS`,
    config: { host, port: 587, secure: false, auth: { user, pass }, tls: { rejectUnauthorized: false } },
  },
  {
    label: 'localhost:25 (Postfix no-auth)',
    config: { host: 'localhost', port: 25, secure: false, tls: { rejectUnauthorized: false } },
  },
];

console.log('SMTP_HOST:', host, '| SMTP_PORT:', port, '| SMTP_USER:', user, '| SMTP_TO:', to);
console.log('---');

for (const { label, config } of configs) {
  process.stdout.write(`Testing ${label} ... `);
  try {
    const t = nodemailer.createTransport(config);
    await t.verify();
    console.log('✅ CONNECTED');

    await t.sendMail({
      from: `"AirComfort Test" <${user}>`,
      to,
      subject: 'Test: AirComfort SMTP works ✅',
      text: `SMTP works via ${label}`,
    });
    console.log(`✅ EMAIL SENT via ${label}`);
    break;
  } catch (err) {
    console.log('❌', err.message);
  }
}
