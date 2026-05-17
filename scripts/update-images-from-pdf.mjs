import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yoffczlzqpzuejxiskum.supabase.co',
  'sb_publishable_hQB36cTxFHLwDkurMyisdA_eDYOoOLt'
);

// Images extracted from PDF catalogs, hosted in /public/images/
const IMAGE_MAP = [
  // Midea home AC
  { match: (n) => n.includes('Breezeless'),        url: '/images/midea-breezeless.png' },
  { match: (n) => n.includes('Xtreme'),            url: '/images/midea-xtreme.png' },
  { match: (n) => n.includes('OASIS PLUS'),        url: '/images/midea-oasis.png' },
  // Midea heat pumps
  { match: (n) => n.includes('M-Thermal Nature'),  url: '/images/midea-mthermal-nature.png' },
  { match: (n) => n.includes('M-Thermal'),         url: '/images/midea-mthermal.png' },
  // TCL Elite
  { match: (n) => n.includes('Elite'),             url: '/images/tcl-elite.png' },
  // Toshiba Estia
  { match: (n) => n.includes('Estia'),             url: '/images/toshiba-estia.png' },
];

const { data: products, error } = await supabase
  .from('products')
  .select('id, name_en, image_url')
  .in('brand', ['Midea', 'TCL', 'Toshiba']);

if (error) {
  console.error('Failed to fetch products:', error.message);
  process.exit(1);
}

console.log(`Fetched ${products.length} products from Midea/TCL/Toshiba\n`);

let updated = 0;
let skipped = 0;
let noMatch = 0;

for (const p of products) {
  const entry = IMAGE_MAP.find(e => e.match(p.name_en));
  if (!entry) {
    console.log(`NO MATCH: ${p.name_en}`);
    noMatch++;
    continue;
  }

  if (p.image_url === entry.url) {
    skipped++;
    continue;
  }

  const { error } = await supabase
    .from('products')
    .update({ image_url: entry.url })
    .eq('id', p.id);

  if (error) {
    console.error(`FAIL: ${p.name_en} — ${error.message}`);
  } else {
    console.log(`OK: ${p.name_en} → ${entry.url}`);
    updated++;
  }
}

console.log(`\nUpdated: ${updated}, Already set: ${skipped}, No match: ${noMatch} (of ${products.length} total)`);
