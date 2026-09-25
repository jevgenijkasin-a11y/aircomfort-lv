// Checks that every uploaded image really is what its extension says
// (magic bytes vs .jpg/.png/.webp) and lists the products using broken files.
//
// Local files + local DB (read-only):
//   node scripts/check-upload-types.mjs [--data ./data]
// Live site over HTTP (reads products via the admin API, fetches every image):
//   ADMIN_PASSWORD=… node scripts/check-upload-types.mjs --base https://aircomfort.lv
//
// Exit code 1 if a file used by a product has the wrong type.
import fs from 'fs';
import path from 'path';
import { arg, adminClient, sniff, extOf, productImages } from './lib/adminClient.mjs';

const base = arg('base');
const rows = []; // { file, ext, real, products[] }

if (typeof base === 'string') {
  const api = await adminClient(base.replace(/\/$/, ''));
  const products = await api.products();
  const byUrl = new Map();
  for (const p of products) for (const u of productImages(p)) byUrl.set(u, [...(byUrl.get(u) || []), p]);
  for (const [u, ps] of byUrl) {
    if (!u.startsWith('/uploads/')) continue;
    const r = await fetch(`${base}${encodeURI(u)}`);
    const real = r.ok ? sniff(Buffer.from(await r.arrayBuffer())) : `HTTP ${r.status}`;
    rows.push({ file: u, ext: extOf(u), real, products: ps });
  }
} else {
  const dataDir = typeof arg('data') === 'string' ? arg('data') : path.join(process.cwd(), 'data');
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(path.join(dataDir, 'aircomfort.db'), { readOnly: true });
  const products = db.prepare('SELECT id, name_ru, name_en, image_url FROM products').all();
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]));
  for (const f of walk(path.join(dataDir, 'uploads'))) {
    const url = '/' + path.relative(dataDir, f).replace(/\\/g, '/');
    const fd = fs.openSync(f, 'r');
    const head = Buffer.alloc(512);
    fs.readSync(fd, head, 0, 512, 0);
    fs.closeSync(fd);
    rows.push({ file: url, ext: extOf(url), real: sniff(head), products: products.filter((p) => productImages(p).includes(url)) });
  }
}

const bad = rows.filter((r) => r.real !== r.ext);
const used = bad.filter((r) => r.products.length);
console.log(`Checked ${rows.length} files: ${bad.length} mismatches (${used.length} used by products, ${bad.length - used.length} unused).\n`);
for (const r of bad) {
  const who = r.products.length ? r.products.map((p) => `${p.name_ru || p.name_en} [${p.id.slice(0, 8)}]`).join('; ') : '(не используется)';
  console.log(`${r.real === 'svg' || r.real === 'html' ? '✗ ЗАГЛУШКА' : '• тип'}  ${r.file}  (.${r.ext} → на самом деле ${r.real})\n      ${who}`);
}
process.exit(used.length ? 1 : 0);
