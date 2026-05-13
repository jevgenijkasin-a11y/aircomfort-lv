import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const products = JSON.parse(readFileSync(join(__dirname, '../hisense_products.json'), 'utf8'));

const supabase = createClient(
  'https://yoffczlzqpzuejxiskum.supabase.co',
  'sb_publishable_hQB36cTxFHLwDkurMyisdA_eDYOoOLt'
);

let inserted = 0;
let failed = 0;

for (const p of products) {
  const features = [
    ...p.features_lv.map(f => `lv:${f}`),
    ...p.features_ru.map(f => `ru:${f}`),
    ...p.features_en.map(f => `en:${f}`),
  ];

  const { error } = await supabase.from('products').insert({
    name_lv: p.name_lv,
    name_ru: p.name_ru,
    name_en: p.name_en,
    brand: p.brand,
    price: p.price,
    install_price: p.install_price,
    power_kw: p.power_kw,
    area_coverage: p.area_coverage,
    energy_class: p.energy_class,
    features,
    image_url: p.image_url,
    category: p.category,
    brand_color: p.brand_color,
    in_stock: p.in_stock,
  });

  if (error) {
    console.error(`FAIL: ${p.name_en} —`, error.message);
    failed++;
  } else {
    console.log(`OK: ${p.name_en}`);
    inserted++;
  }
}

console.log(`\nДобавлено: ${inserted} / ${products.length} (ошибки: ${failed})`);
