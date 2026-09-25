// Tiny client for the AirComfort admin API (same endpoints the admin panel uses).
// Password: env ADMIN_PASSWORD, or --password-file <path>. Never hard-code it.
import fs from 'fs';

export function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}

export async function adminClient(base) {
  const pwFile = arg('password-file');
  const password = process.env.ADMIN_PASSWORD || (typeof pwFile === 'string' ? fs.readFileSync(pwFile, 'utf8').trim() : '');
  if (!password) throw new Error('Set ADMIN_PASSWORD (or pass --password-file <file>) to log in to the admin API.');
  const r = await fetch(`${base}/api/admin/auth`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  });
  if (!r.ok) throw new Error(`Admin login failed at ${base} (HTTP ${r.status}).`);
  const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
  const call = async (path, init = {}) => {
    const res = await fetch(`${base}${path}`, { ...init, headers: { ...(init.headers || {}), cookie } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${init.method || 'GET'} ${path} → HTTP ${res.status}: ${body.error || ''}`);
    return body;
  };
  return {
    products: () => call('/api/admin/products'),
    updateProduct: (id, patch) => call(`/api/admin/products/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    }),
    /** Uploads through /api/admin/upload (type check + WebP compression), returns the stored URL. */
    upload: async (buf, fileName, type) => {
      const fd = new FormData();
      fd.append('file', new Blob([buf], { type }), fileName);
      return (await call('/api/admin/upload', { method: 'POST', body: fd })).url;
    },
    revalidate: () => call('/api/admin/revalidate', { method: 'POST' }),
  };
}

/** Real image type from the first bytes, regardless of the file name. */
export function sniff(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 4).toString('hex') === '89504e47') return 'png';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  if (b.subarray(4, 8).toString('latin1') === 'ftyp' && /avi[fs]/.test(b.subarray(8, 12).toString('latin1'))) return 'avif';
  if (b.subarray(0, 4).toString('latin1') === 'GIF8') return 'gif';
  const t = b.subarray(0, 512).toString('utf8').replace(/^﻿/, '').trimStart().toLowerCase();
  if (t.startsWith('<svg') || (t.startsWith('<?xml') && t.includes('<svg'))) return 'svg';
  if (t.startsWith('<')) return 'html';
  return 'unknown';
}
export const RASTER = ['jpg', 'png', 'webp', 'avif', 'gif'];
export const extOf = (url) => { const e = (url.split('?')[0].split('.').pop() || '').toLowerCase(); return e === 'jpeg' ? 'jpg' : e; };
export const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' };

export function productImages(p) {
  if (p.image_url?.startsWith('[')) { try { return JSON.parse(p.image_url); } catch { /* fall through */ } }
  return p.image_url ? [p.image_url] : [];
}
export const galleryValue = (urls) => (urls.length > 1 ? JSON.stringify(urls) : urls[0] || '');
