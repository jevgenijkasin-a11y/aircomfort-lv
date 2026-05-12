import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://yoffczlzqpzuejxiskum.supabase.co',
  'sb_publishable_hQB36cTxFHLwDkurMyisdA_eDYOoOLt'
);

// 3 residential heat pump products
const products = [
  {
    name_lv: 'Daikin Altherma 3 R32 8kW',
    name_ru: 'Daikin Altherma 3 R32 8кВт',
    name_en: 'Daikin Altherma 3 R32 8kW',
    brand: 'Daikin',
    price: 4500,
    install_price: 900,
    power_kw: 8,
    area_coverage: '120',
    energy_class: 'A+++',
    features: ['Siltumsūknis gaiss-ūdens', 'COP līdz 4.9', 'R-32 apkopes viela', 'Klusais režīms 25dB'],
    image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+Altherma+3',
    category: 'heat_pump',
    brand_color: '#0067b0',
    in_stock: true,
  },
  {
    name_lv: 'Mitsubishi Ecodan PUHZ-SW80VHA',
    name_ru: 'Mitsubishi Ecodan PUHZ-SW80VHA',
    name_en: 'Mitsubishi Ecodan PUHZ-SW80VHA',
    brand: 'Mitsubishi',
    price: 5200,
    install_price: 950,
    power_kw: 8,
    area_coverage: '130',
    energy_class: 'A++',
    features: ['Zemu temperatūru darbība -25°C', 'COP līdz 4.7', 'Integrēta karstā ūdens ražošana', 'WiFi vadība'],
    image_url: 'https://placehold.co/400x300/e60012/white?text=Mitsubishi+Ecodan',
    category: 'heat_pump',
    brand_color: '#e60012',
    in_stock: true,
  },
  {
    name_lv: 'Bosch Compress 3000 AWS 8kW',
    name_ru: 'Bosch Compress 3000 AWS 8кВт',
    name_en: 'Bosch Compress 3000 AWS 8kW',
    brand: 'Bosch',
    price: 3800,
    install_price: 850,
    power_kw: 8,
    area_coverage: '110',
    energy_class: 'A+',
    features: ['Kompakts dizains', 'COP līdz 4.2', 'Viegla uzstādīšana', 'Jaukšanas ierīce iekļauta'],
    image_url: 'https://placehold.co/400x300/007bc0/white?text=Bosch+Compress+3000',
    category: 'heat_pump',
    brand_color: '#007bc0',
    in_stock: true,
  },
];

const { data, error } = await sb.from('products').insert(products).select('id, name_lv');
if (error) console.error('Insert error:', error);
else console.log('Inserted:', JSON.stringify(data));

// Update image URLs for existing products
const updates = [
  { name_lv: 'Daikin Perfera FTXM25R', image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+Perfera' },
  { name_lv: 'Mitsubishi MSZ-EF25VGK', image_url: 'https://placehold.co/400x300/e60012/white?text=Mitsubishi+MSZ-EF' },
  { name_lv: 'Samsung WindFree Comfort', image_url: 'https://placehold.co/400x300/1428a0/white?text=Samsung+WindFree' },
  { name_lv: 'LG Artcool AC12BK', image_url: 'https://placehold.co/400x300/a50034/white?text=LG+Artcool' },
  { name_lv: 'Panasonic Etherea CS-Z35TKEW', image_url: 'https://placehold.co/400x300/0034a4/white?text=Panasonic+Etherea' },
  { name_lv: 'Daikin FCAG71A Kasetes', image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+Kasetes' },
  { name_lv: 'Mitsubishi PCA-M71KA Kasetes', image_url: 'https://placehold.co/400x300/e60012/white?text=Mitsubishi+Kasetes' },
  { name_lv: 'Daikin FBQ100D Kanāls', image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+Kanals' },
  { name_lv: 'LG ThermaV R32 Gaiss-Ūders', image_url: 'https://placehold.co/400x300/a50034/white?text=LG+ThermaV' },
  { name_lv: 'Daikin Altherma 3 H HT', image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+Altherma+HT' },
  { name_lv: 'Daikin Kasetnes FFA60A 6kW', image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+FFA60A' },
  { name_lv: 'Mitsubishi FDTC50VF 5kW', image_url: 'https://placehold.co/400x300/e60012/white?text=Mitsubishi+FDTC' },
  { name_lv: 'LG Kanalu UT18F 5kW', image_url: 'https://placehold.co/400x300/a50034/white?text=LG+Kanals' },
  { name_lv: 'Daikin Altherma ERGA08 8kW', image_url: 'https://placehold.co/400x300/0067b0/white?text=Daikin+ERGA08' },
  { name_lv: 'Mitsubishi Zubadan 12kW', image_url: 'https://placehold.co/400x300/e60012/white?text=Mitsubishi+Zubadan' },
  { name_lv: 'Samsung DVM S 10kW VRF', image_url: 'https://placehold.co/400x300/1428a0/white?text=Samsung+DVM' },
  { name_lv: 'Panasonic Aquarea 12kW', image_url: 'https://placehold.co/400x300/0034a4/white?text=Panasonic+Aquarea' },
];

for (const u of updates) {
  const { error: ue } = await sb
    .from('products')
    .update({ image_url: u.image_url })
    .eq('name_lv', u.name_lv);
  if (ue) console.error(`Update error for ${u.name_lv}:`, ue);
  else console.log(`Updated image for: ${u.name_lv}`);
}
