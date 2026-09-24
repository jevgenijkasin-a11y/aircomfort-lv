// One-time: shrink already-uploaded images (≤1920 px) WITHOUT renaming them,
// so every URL stored in the database keeps working.
//
//   node scripts/optimize-existing-uploads.mjs [inputDir] [outputDir]
//
// Default input: data/uploads (download the server's httpdocs/data/uploads
// there first). Output: migration/optimized-uploads — upload its contents back
// over httpdocs/data/uploads via FTP. Files that don't get smaller are skipped.
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const IN = process.argv[2] || 'data/uploads';
const OUT = process.argv[3] || 'migration/optimized-uploads';
const MAX = 1920;

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let before = 0, after = 0, changed = 0, skipped = 0;
for await (const file of walk(IN)) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
  const src = await fs.readFile(file);
  let img = sharp(src).rotate().resize({ width: MAX, withoutEnlargement: true });
  img = ext === '.png' ? img.png({ compressionLevel: 9, palette: true, quality: 85 })
      : ext === '.webp' ? img.webp({ quality: 82 })
      : img.jpeg({ quality: 80, mozjpeg: true });
  const out = await img.toBuffer();
  before += src.length;
  if (out.length >= src.length * 0.9) { skipped++; after += src.length; continue; }
  const dest = path.join(OUT, path.relative(IN, file));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, out);
  after += out.length; changed++;
}
const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
console.log(`optimized ${changed}, unchanged ${skipped}; total ${mb(before)} -> ${mb(after)}`);
console.log(`upload the contents of ${OUT} over httpdocs/data/uploads (same paths)`);
