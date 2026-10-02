// Prepares the generated article pictures for the site:
//   - paints over third-party brand logos (filled from the surrounding surface),
//   - saves WebP into public/images/blog/<slug>/<name>.webp.
//
//   node scripts/blog-images.cjs ["C:\…\statji\img"]
// Source folders: статья1…статья4 with the original .jfif files.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || 'C:/Users/Jevgenij/Pictures/Mycond-каталог/statji/img';
const OUT = path.join(__dirname, '..', 'public', 'images', 'blog');

// [folder, file prefix, slug, name, logo boxes [x, y, w, h] in source pixels]
const IMAGES = [
  ['статья1', 'Обложка', 'valsts-atbalsts-siltumsuknim-2026', 'cover', [[540, 382, 40, 32]]],
  ['статья1', 'Фото для раздела «Сколько', 'valsts-atbalsts-siltumsuknim-2026', 'atbalsta-summas', []],
  ['статья1', 'Фото для раздела «Какое', 'valsts-atbalsts-siltumsuknim-2026', 'iekartas-majai', [[1230, 268, 36, 50], [1240, 334, 28, 20]]],
  ['статья1', 'Фото для раздела «Что сделать', 'valsts-atbalsts-siltumsuknim-2026', 'pirms-pirkuma', [[856, 528, 26, 13]]],
  ['статья2', 'Обложка', 'siltumsuknis-gaiss-udens-vai-gaiss-gaiss', 'cover', [[836, 360, 62, 42]]],
  ['статья2', 'Фото для раздела «Воздух-вода»', 'siltumsuknis-gaiss-udens-vai-gaiss-gaiss', 'gaiss-udens', [[573, 286, 62, 44], [758, 344, 44, 28]]],
  ['статья2', 'Фото для раздела «Воздух-воздух»', 'siltumsuknis-gaiss-udens-vai-gaiss-gaiss', 'gaiss-gaiss', [[652, 207, 20, 10]]],
  ['статья2', 'Фото для раздела «Господдержка»', 'siltumsuknis-gaiss-udens-vai-gaiss-gaiss', 'ka-izveleties', [[834, 374, 62, 52]]],
  ['статья3', 'Обложка', 'fankoili-ar-siltumsukni', 'cover', [[646, 271, 18, 18]]],
  ['статья3', 'Фото для раздела «Что такое', 'fankoili-ar-siltumsukni', 'ka-darbojas', []],
  ['статья3', 'Фото для раздела «Типы', 'fankoili-ar-siltumsukni', 'fankoilu-tipi', []],
  ['статья3', 'Фото для раздела «Термостаты', 'fankoili-ar-siltumsukni', 'termostats', []],
  ['статья4', 'Обложка', 'kondicionieris-dzivoklim-jaudas-izvele', 'cover', [[601, 132, 22, 9]]],
  ['статья4', 'Фото для раздела «Простое', 'kondicionieris-dzivoklim-jaudas-izvele', 'jaudas-aprekins', []],
  ['статья4', 'Фото для раздела «Инвертор', 'kondicionieris-dzivoklim-jaudas-izvele', 'invertors', []],
  ['статья4', 'Фото для раздела «Шум', 'kondicionieris-dzivoklim-jaudas-izvele', 'troksnis-gulamistaba', [[840, 155, 18, 8], [1002, 130, 20, 9]]],
];

/** Fills a box from its border: blend of top↔bottom and left↔right interpolation, soft edges. */
function fillBox(px, W, H, C, [bx, by, bw, bh]) {
  const at = (x, y, c) => px[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * C + c];
  const x0 = bx - 1, x1 = bx + bw, y0 = by - 1, y1 = by + bh;
  const orig = Buffer.from(px);
  for (let y = by; y < by + bh; y++) {
    for (let x = bx; x < bx + bw; x++) {
      const ty = (y - y0) / (y1 - y0), tx = (x - x0) / (x1 - x0);
      // distance to the nearest box edge → feather the outer 3 px
      const edge = Math.min(x - bx, bx + bw - 1 - x, y - by, by + bh - 1 - y);
      const k = Math.min(1, (edge + 1) / 3);
      for (let c = 0; c < 3; c++) {
        const v = (at(x, y0, c) * (1 - ty) + at(x, y1, c) * ty) * 0.5 + (at(x0, y, c) * (1 - tx) + at(x1, y, c) * tx) * 0.5;
        const i = (y * W + x) * C + c;
        px[i] = Math.round(v * k + orig[i] * (1 - k));
      }
    }
  }
}

(async () => {
  for (const [dir, prefix, slug, name, boxes] of IMAGES) {
    const file = fs.readdirSync(path.join(SRC, dir)).find((f) => f.startsWith(prefix));
    if (!file) throw new Error(`${dir}: no file starting with "${prefix}"`);
    const { data, info } = await sharp(path.join(SRC, dir, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (const b of boxes) fillBox(data, info.width, info.height, info.channels, b);
    fs.mkdirSync(path.join(OUT, slug), { recursive: true });
    const out = path.join(OUT, slug, `${name}.webp`);
    await sharp(data, { raw: info }).webp({ quality: 80, effort: 6 }).toFile(out);
    console.log(`${slug}/${name}.webp  ${(fs.statSync(out).size / 1024).toFixed(0)} KB  (${boxes.length} logo area(s) retouched)`);
  }
})();
