import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yoffczlzqpzuejxiskum.supabase.co',
  'sb_publishable_hQB36cTxFHLwDkurMyisdA_eDYOoOLt'
);

// daikin.lv image URLs (hotlinking allowed)
const D_SENSIRA  = 'https://www.daikin.lv/lv_LV/product-group/air-to-air-heat-pumps/sensira/_jcr_content/image169.coreimg.jpeg/1651266264471/daikin-sensira-header.jpeg';
const D_PERFERA  = 'https://www.daikin.lv/lv_LV/product-group/air-to-air-heat-pumps/ftxm-m/_jcr_content/image169.coreimg.jpeg/1651305282810/perfera-header-ftxm-20n-01-02.jpeg';
const D_PERF_FLR = 'https://www.daikin.lv/lv_LV/product-group/air-to-air-heat-pumps/ftxm-m/perfera-floor-standing/_jcr_content/image169.coreimg.jpeg/1720104410579/06-warm-packshot-fvxm-a9-4-3-front.jpeg';
const D_STYLISH  = 'https://www.daikin.lv/lv_LV/product-group/air-to-air-heat-pumps/stylish/_jcr_content/image169.coreimg.jpeg/1707655045126/ctxa-bb-5.jpeg';
const D_EMURA    = 'https://www.daikin.lv/lv_LV/product-group/air-to-air-heat-pumps/emura/_jcr_content/image169.coreimg.png/1651263399998/daikin-emura3-white-ftxj-aw-1-1.png';
const D_MULTI    = 'https://www.daikin.lv/lv_LV/product-group/air-to-air-heat-pumps/multi/_jcr_content/image169.coreimg.jpeg/1651305327722/2-multi-split-balconies-4c-vertical-710x460.jpeg';
const D_CASSETTE = 'https://www.daikin.lv/lv_LV/product-group/round-flow-cassette/_jcr_content/image169.coreimg.jpeg/1651305853114/header-2-roundflow.jpeg';
const D_FLAT_CAS = 'https://www.daikin.lv/lv_LV/product-group/fully-flat-cassette/_jcr_content/image169.coreimg.png/1651305708738/header-fullyflatcassette.png';
const D_SKYAIR   = 'https://www.daikin.lv/lv_LV/product-group/sky-air/_jcr_content/image169.coreimg.jpeg/1651305858745/roundflow-cassette-white-panels-retail-sky-air.jpeg';
const D_ATH_R    = 'https://www.daikin.lv/lv_LV/product-group/air-to-water-heat-pump-low-temperature/_jcr_content/image169.coreimg.jpeg/1651304934228/heatpump-lowtemperature-1645px1080px-header.jpeg';
const D_ATH_HT   = 'https://www.daikin.lv/lv_LV/product-group/air-to-water-heat-pump-high-temperature/daikin-altherma-3h-ht/_jcr_content/image169.coreimg.png/1651267332841/altherma-3h-ht-combination.png';
const D_ATH_GEO  = 'https://www.daikin.lv/lv_LV/product-group/ground-source-heat-pump/daikin-altherma-3-geo/_jcr_content/image169.coreimg.png/1651268082384/egsah-x-d9w-ip4.png';

// ekopluss.lv image URLs (hotlinking allowed)
const T_POLAR    = 'http://www.ekopluss.lv/img/p/3/2/3/323-thickbox_default.jpg';
const T_PREMIUM  = 'http://www.ekopluss.lv/img/p/3/2/6/326-thickbox_default.jpg';
const T_HAORI    = 'http://www.ekopluss.lv/img/p/3/3/6/336-thickbox_default.jpg';
const T_AURORA   = 'http://www.ekopluss.lv/img/p/3/3/8/338-thickbox_default.jpg';
const T_SEIYA    = 'http://www.ekopluss.lv/img/p/4/4/4/444-thickbox_default.jpg';
const T_SHORAI   = 'http://www.ekopluss.lv/img/p/4/7/2/472-thickbox_default.jpg';

// tcl-aircon.lv URLs (hotlinking allowed)
const C_OCARINA  = 'https://tcl-aircon.lv/wp-content/uploads/2023/09/mjup3t5bba8k6hbn7o4z7lpj127j8i76.jpg';
const C_FRESHIN  = 'https://tcl-aircon.lv/wp-content/uploads/2023/09/nstiz62ug5h45sq5mwghij44elvuxgl7.jpg';
const C_BREEZEIN = 'https://tcl-aircon.lv/wp-content/uploads/2024/02/fbi-main_1-min.png';

// JSON helper
const arr = (...urls) => JSON.stringify(urls.filter(Boolean));

const IMAGE_MAP = [
  // === Daikin home ===
  { match: n => (n.includes('Sensira') || n.includes('Comfora')) && !n.includes('Perfera'),
    urls: arr(D_SENSIRA, '/images/daikin-comfora-system.png', '/images/daikin-sensira-indoor.png') },
  { match: n => n.includes('Perfera Floor') || n.includes('FVXM') || n.includes('FVXTM'),
    urls: arr(D_PERF_FLR) },
  { match: n => n.includes('Perfera') && !n.includes('Floor') && !n.includes('FVXM'),
    urls: arr(D_PERFERA, '/images/daikin-perfera-system.png') },
  { match: n => n.includes('Stylish'),
    urls: arr(D_STYLISH, '/images/daikin-stylish-system.png', '/images/daikin-stylish-black.png') },
  { match: n => n.includes('Emura'),
    urls: arr(D_EMURA, '/images/daikin-emura-system.png', '/images/daikin-emura-silver.png') },
  // === Daikin commercial ===
  { match: n => n.includes('Multi'),
    urls: arr(D_MULTI) },
  { match: n => n.includes('FCAG'),
    urls: arr(D_CASSETTE) },
  { match: n => n.includes('FFA') || n.includes('Sky Air Cassette') || n.includes('Cassette FFA'),
    urls: arr(D_FLAT_CAS) },
  { match: n => n.includes('FBA') || n.includes('SkyAir Duct') || n.includes('Medium Pressure Duct') || n.includes('FDXM') || n.includes('FBQ') || n.includes('Ducted'),
    urls: arr(D_SKYAIR) },
  { match: n => n.includes('Server Room'),
    urls: arr(D_PERFERA) },
  // === Daikin Altherma ===
  { match: n => n.includes('Altherma 3 H HT') || n.includes('EPRA'),
    urls: arr(D_ATH_HT) },
  { match: n => n.includes('Altherma 3 GEO') || n.includes('EGSAH'),
    urls: arr(D_ATH_GEO) },
  { match: n => n.includes('Altherma'),
    urls: arr(D_ATH_R) },
  // === Midea home ===
  { match: n => n.includes('Breezeless'),
    urls: arr('/images/midea-breezeless.png') },
  { match: n => n.includes('Xtreme'),
    urls: arr('/images/midea-xtreme.png') },
  { match: n => n.includes('OASIS PLUS'),
    urls: arr('/images/midea-oasis.png') },
  // === Midea heat pump ===
  // M-Thermal Nature = monoblock; M-Thermal = split with hydrobox
  { match: n => n.includes('M-Thermal Nature'),
    urls: arr('/images/midea-mthermal.png', '/images/midea-nature-front.png') },
  { match: n => n.includes('M-Thermal') && !n.includes('Nature'),
    urls: arr('/images/midea-mthermal-split.png', '/images/midea-mthermal-boiler.png') },
  // === TCL ===
  { match: n => n.includes('Elite'),
    urls: arr('/images/tcl-elite.png', '/images/tcl-elite-white.png') },
  { match: n => n.includes('Ocarina'),
    urls: arr(C_OCARINA, '/images/tcl-ocarina.png') },
  { match: n => n.includes('BreezeIN'),
    urls: arr(C_BREEZEIN, '/images/tcl-breezein2.png') },
  { match: n => n.includes('FreshIN'),
    urls: arr(C_FRESHIN, '/images/tcl-freshin-gray.png', '/images/tcl-freshin3.png') },
  // === Toshiba ===
  { match: n => n.includes('Estia'),
    urls: arr('/images/toshiba-estia.png', '/images/toshiba-estia-outdoor.png') },
  { match: n => n.includes('Haori'),
    urls: arr(T_HAORI, '/images/toshiba-haori.png') },
  { match: n => n.includes('Seiya'),
    urls: arr(T_SEIYA, '/images/toshiba-seiya.png') },
  { match: n => n.includes('Polar'),
    urls: arr(T_POLAR, '/images/toshiba-polar.png') },
  { match: n => n.includes('Premium'),
    urls: arr(T_PREMIUM, '/images/toshiba-polar.png') },
  { match: n => n.includes('Aurora'),
    urls: arr(T_AURORA) },
  { match: n => n.includes('Shorai'),
    urls: arr(T_SHORAI) },
];

const { data: products, error } = await supabase
  .from('products')
  .select('id, name_en, image_url')
  .in('brand', ['Daikin', 'Midea', 'TCL', 'Toshiba']);

if (error) { console.error('Fetch error:', error.message); process.exit(1); }

console.log(`Fetched ${products.length} products\n`);

let updated = 0, skipped = 0, noMatch = 0;

for (const p of products) {
  const entry = IMAGE_MAP.find(e => e.match(p.name_en));
  if (!entry) {
    console.log(`NO MATCH: ${p.name_en}`);
    noMatch++;
    continue;
  }

  if (p.image_url === entry.urls) {
    skipped++;
    continue;
  }

  const { error } = await supabase.from('products').update({ image_url: entry.urls }).eq('id', p.id);
  if (error) {
    console.error(`FAIL: ${p.name_en} — ${error.message}`);
  } else {
    const count = JSON.parse(entry.urls).length;
    console.log(`OK (${count} photos): ${p.name_en}`);
    updated++;
  }
}

console.log(`\nUpdated: ${updated}, Already set: ${skipped}, No match: ${noMatch}`);
