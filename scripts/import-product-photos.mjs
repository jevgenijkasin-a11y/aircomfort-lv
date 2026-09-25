// Imports product photos from folders named exactly like the product (RU name):
//   <dir>/<Product name>/<Product name> - 1.webp, - 2.webp, …   ("- 1" = main photo)
// Uploads go through /api/admin/upload — the same path as the admin panel
// (content type check + WebP compression) — then the product gallery is replaced.
//
//   ADMIN_PASSWORD=… node scripts/import-product-photos.mjs [--base http://localhost:3000]
//        [--dir "C:\Users\…\AirComfort-фото (сжатые WebP)"] [--apply] [--replace-existing] [--fix-mismatch]
//
// Default is a dry run: prints folder → product → photos → what would change.
//   --apply             really upload and save
//   --replace-existing  also replace galleries that already have real photos
//   --fix-mismatch      re-upload product images whose content doesn't match the
//                       extension (JPG saved as .png etc.) so every file is valid WebP
import fs from 'fs';
import path from 'path';
import { arg, adminClient, sniff, extOf, productImages, galleryValue, RASTER, MIME } from './lib/adminClient.mjs';

const base = (typeof arg('base') === 'string' ? arg('base') : 'http://localhost:3000').replace(/\/$/, '');
const dir = typeof arg('dir') === 'string' ? arg('dir') : 'C:\\Users\\Jevgenij\\Pictures\\AirComfort-фото (сжатые WebP)';
const apply = arg('apply') === true;
const replaceExisting = arg('replace-existing') === true;
const fixMismatch = arg('fix-mismatch') === true;

const api = await adminClient(base);
const products = await api.products();
const norm = (s) => (s || '').normalize('NFC').replace(/\s+/g, ' ').trim();

/** Real type of an image already on the site. */
async function remoteType(url) {
  if (!url.startsWith('/uploads/')) return 'external';
  const r = await fetch(`${base}${encodeURI(url)}`);
  return r.ok ? sniff(Buffer.from(await r.arrayBuffer())) : 'missing';
}

console.log(`${apply ? 'APPLY' : 'DRY RUN'} — ${base}\nFolder: ${dir}\n`);
const unmatched = [];
let changed = 0;

for (const folder of fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const name = norm(folder);
  const matches = products.filter((p) => norm(p.name_ru) === name);
  if (matches.length !== 1) { unmatched.push({ folder, reason: matches.length ? `${matches.length} товара с таким названием` : 'товар не найден' }); continue; }
  const p = matches[0];

  const files = fs.readdirSync(path.join(dir, folder))
    .map((f) => ({ f, m: f.normalize('NFC').match(/ - (\d+)\.(webp|jpe?g|png|avif)$/i) }))
    .filter((x) => x.m)
    .sort((a, b) => Number(a.m[1]) - Number(b.m[1]))
    .map((x) => x.f);

  const current = productImages(p);
  const types = await Promise.all(current.map(remoteType));
  const realCount = types.filter((t) => RASTER.includes(t)).length;
  const stubs = types.filter((t) => t === 'svg' || t === 'html').length;
  const state = !current.length ? 'пустая галерея' : stubs === current.length ? `${stubs} заглушк(и) SVG` : `${realCount} настоящих фото${stubs ? ` + ${stubs} заглушк.` : ''}`;
  const willReplace = !current.length || realCount === 0 || replaceExisting;

  console.log(`▸ ${folder}\n    → ${p.name_ru} [${p.id.slice(0, 8)}]  сейчас: ${state}\n    файлов: ${files.length} (${files.map((f) => f.match(/ - (\d+)\./)[1]).join(', ')})  ⇒ ${willReplace ? 'ЗАМЕНИТЬ галерею' : 'пропустить (есть настоящие фото, нужен --replace-existing)'}`);
  if (!willReplace || !files.length) continue;

  if (apply) {
    const urls = [];
    for (const f of files) {
      const buf = fs.readFileSync(path.join(dir, folder, f));
      const real = sniff(buf);
      if (!RASTER.includes(real)) { console.log(`    ! ${f}: не изображение (${real}) — пропущен`); continue; }
      urls.push(await api.upload(buf, f, MIME[real]));
    }
    if (urls.length) {
      await api.updateProduct(p.id, { image_url: galleryValue(urls) });
      console.log(`    ✓ сохранено ${urls.length} фото, главное: ${urls[0]}`);
      changed++;
    }
  }
}

if (fixMismatch) {
  console.log('\n— Файлы с неверным расширением у товаров —');
  const fresh = apply ? await api.products() : products;
  const cache = new Map(); // old url → new url (files shared by several products are uploaded once)
  for (const p of fresh) {
    const urls = productImages(p);
    let dirty = false;
    const next = [];
    for (const u of urls) {
      const real = await remoteType(u);
      if (!RASTER.includes(real) || real === extOf(u)) { next.push(u); continue; }
      if (!cache.has(u)) {
        console.log(`  ${u} (.${extOf(u)} → ${real})`);
        if (apply) {
          const buf = Buffer.from(await (await fetch(`${base}${encodeURI(u)}`)).arrayBuffer());
          cache.set(u, await api.upload(buf, path.basename(u).replace(/\.\w+$/, `.${real}`), MIME[real]));
        } else cache.set(u, u);
      }
      next.push(cache.get(u));
      dirty = true;
    }
    if (dirty) {
      console.log(`    ${apply ? '✓' : '→'} ${p.name_ru}`);
      if (apply) { await api.updateProduct(p.id, { image_url: galleryValue(next) }); changed++; }
    }
  }
}

if (unmatched.length) {
  console.log('\n— Папки без совпадения (ничего не создано) —');
  for (const u of unmatched) console.log(`  ${u.folder}: ${u.reason}`);
}
if (apply && changed) await api.revalidate();
console.log(`\n${apply ? `Готово: изменено товаров — ${changed}.` : 'Это dry-run. Для записи добавьте --apply.'}`);
