-- =========================================================
-- AirComfort – Supabase Schema
-- Run this in the Supabase SQL Editor
-- =========================================================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            BIGSERIAL PRIMARY KEY,
  name_lv       TEXT NOT NULL DEFAULT '',
  name_ru       TEXT NOT NULL DEFAULT '',
  name_en       TEXT NOT NULL DEFAULT '',
  brand         TEXT NOT NULL DEFAULT '',
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  install_price NUMERIC(10,2) DEFAULT 249,
  power_kw      NUMERIC(4,1) DEFAULT 2.5,
  area_coverage TEXT DEFAULT '20–25',
  energy_class  TEXT DEFAULT 'A++',
  features      JSONB DEFAULT '[]',
  image_url     TEXT DEFAULT '',
  category      TEXT DEFAULT 'home',
  brand_color   TEXT DEFAULT '#1A6B9A',
  in_stock      BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_select"  ON products;
DROP POLICY IF EXISTS "allow_insert"  ON products;
DROP POLICY IF EXISTS "allow_update"  ON products;
DROP POLICY IF EXISTS "allow_delete"  ON products;
CREATE POLICY "allow_select" ON products FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_delete" ON products FOR DELETE USING (true);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  email      TEXT DEFAULT '',
  service    TEXT DEFAULT '',
  message    TEXT DEFAULT '',
  status     TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_select"  ON contacts;
DROP POLICY IF EXISTS "allow_insert"  ON contacts;
DROP POLICY IF EXISTS "allow_update"  ON contacts;
DROP POLICY IF EXISTS "allow_delete"  ON contacts;
CREATE POLICY "allow_select" ON contacts FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON contacts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_delete" ON contacts FOR DELETE USING (true);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id    BIGSERIAL PRIMARY KEY,
  key   TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT ''
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_select"  ON settings;
DROP POLICY IF EXISTS "allow_insert"  ON settings;
DROP POLICY IF EXISTS "allow_update"  ON settings;
DROP POLICY IF EXISTS "allow_delete"  ON settings;
CREATE POLICY "allow_select" ON settings FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_delete" ON settings FOR DELETE USING (true);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('phone',              '+371 20 000 000'),
  ('email',              'info@aircomfort.lv'),
  ('address',            'Rīga, Latvija'),
  ('hours',              'Pn–Pt 9:00–18:00'),
  ('whatsapp_number',    ''),
  ('telegram_username',  ''),
  ('hero_title_lv',      ''),
  ('hero_title_ru',      ''),
  ('hero_title_en',      ''),
  ('hero_subtitle_lv',   ''),
  ('hero_subtitle_ru',   ''),
  ('hero_subtitle_en',   ''),
  ('stat1_value',        '500+'),
  ('stat1_label_lv',     'apmierināti klienti'),
  ('stat1_label_ru',     'довольных клиентов'),
  ('stat1_label_en',     'happy clients'),
  ('stat2_value',        '5'),
  ('stat2_label_lv',     'gadi tirgū'),
  ('stat2_label_ru',     'лет на рынке'),
  ('stat2_label_en',     'years on the market'),
  ('stat3_value',        '10+'),
  ('stat3_label_lv',     'zīmoli katalogā'),
  ('stat3_label_ru',     'брендов в каталоге'),
  ('stat3_label_en',     'brands in catalog')
ON CONFLICT (key) DO NOTHING;

-- Sample products
INSERT INTO products (name_lv, name_ru, name_en, brand, price, install_price, power_kw, area_coverage, energy_class, features, category, brand_color) VALUES
  -- Home
  ('Daikin Perfera FTXM25R',             'Daikin Perfera FTXM25R',             'Daikin Perfera FTXM25R',             'Daikin',     649,  249, 2.5, '20–25',  'A+++', '["Inverter","Wi-Fi","Kluss"]',                'home',                '#003087'),
  ('Daikin Perfera FTXM35R',             'Daikin Perfera FTXM35R',             'Daikin Perfera FTXM35R',             'Daikin',     749,  249, 3.5, '25–35',  'A+++', '["Inverter","Wi-Fi"]',                        'home',                '#003087'),
  ('Mitsubishi MSZ-EF25VGK',             'Mitsubishi MSZ-EF25VGK',             'Mitsubishi MSZ-EF25VGK',             'Mitsubishi', 729,  249, 2.5, '20–25',  'A+++', '["Inverter","Wi-Fi","Dizains"]',              'home',                '#E4002B'),
  ('Mitsubishi MSZ-EF50VGK',             'Mitsubishi MSZ-EF50VGK',             'Mitsubishi MSZ-EF50VGK',             'Mitsubishi', 1149, 299, 5.0, '40–55',  'A++',  '["Inverter","Wi-Fi","Dizains"]',              'home',                '#E4002B'),
  ('Samsung WindFree Comfort',           'Samsung WindFree Comfort',           'Samsung WindFree Comfort',           'Samsung',    599,  249, 2.5, '20–25',  'A++',  '["Inverter","Wi-Fi","WindFree"]',             'home',                '#1428A0'),
  ('Samsung WindFree Elite',             'Samsung WindFree Elite',             'Samsung WindFree Elite',             'Samsung',    699,  249, 3.5, '25–35',  'A++',  '["Inverter","Wi-Fi","WindFree"]',             'home',                '#1428A0'),
  ('LG Artcool AC09BK',                  'LG Artcool AC09BK',                  'LG Artcool AC09BK',                  'LG',         639,  249, 2.5, '20–25',  'A+++', '["Inverter","Wi-Fi","Dizains"]',              'home',                '#A50034'),
  ('Panasonic Etherea CS-Z25ZKEW',       'Panasonic Etherea CS-Z25ZKEW',       'Panasonic Etherea CS-Z25ZKEW',       'Panasonic',  779,  249, 2.5, '20–25',  'A+++', '["Inverter","Wi-Fi","nanoe-X"]',              'home',                '#0047BB'),
  -- Heat pumps
  ('Daikin Altherma 3 R 4 kW',          'Daikin Altherma 3 R 4 кВт',         'Daikin Altherma 3 R 4 kW',          'Daikin',     2990, 499, 4.0, '60–80',  'A+++', '["Siltumsūknis","Apkure","Dzesēšana"]',       'heat_pump',           '#003087'),
  ('Daikin Altherma 3 R 8 kW',          'Daikin Altherma 3 R 8 кВт',         'Daikin Altherma 3 R 8 kW',          'Daikin',     3990, 599, 8.0, '120–160','A+++', '["Siltumsūknis","Apkure","Dzesēšana","Wi-Fi"]','heat_pump',          '#003087'),
  ('Mitsubishi Zubadan 8.0 kW',         'Mitsubishi Zubadan 8.0 кВт',        'Mitsubishi Zubadan 8.0 kW',         'Mitsubishi', 4290, 599, 8.0, '120–150','A+++', '["Siltumsūknis","Zubadan","Ziemas režīms"]',  'heat_pump',           '#E4002B'),
  ('Samsung ClimateHub 8 kW',           'Samsung ClimateHub 8 кВт',          'Samsung ClimateHub 8 kW',           'Samsung',    3490, 549, 8.0, '100–140','A++',  '["Siltumsūknis","Wi-Fi","AI Control"]',        'heat_pump',           '#1428A0'),
  -- Commercial
  ('Daikin Sky Air RZASG71MV1',         'Daikin Sky Air RZASG71МВ1',         'Daikin Sky Air RZASG71MV1',         'Daikin',     1890, 399, 7.1, '60–80',  'A++',  '["Kasete","Inverter","Centralizēta vadība"]',  'commercial',          '#003087'),
  ('Mitsubishi City Multi PLFY-P50',    'Mitsubishi City Multi PLFY-P50',    'Mitsubishi City Multi PLFY-P50',    'Mitsubishi', 2190, 449, 5.0, '40–60',  'A++',  '["Kasete","Inverter","BACnet"]',               'commercial',          '#E4002B'),
  ('LG Multi V S 10 HP',                'LG Multi V S 10 л.с.',              'LG Multi V S 10 HP',                'LG',         4990, 699,10.0, '150–200','A+',   '["VRF","Vairāki bloki","Smart ThinQ"]',        'commercial',          '#A50034')
ON CONFLICT DO NOTHING;

-- Migrate existing category values
UPDATE products SET category = 'home' WHERE category IN ('split', 'multi-split');
UPDATE products SET category = 'heat_pump' WHERE category IN ('heat-pump');