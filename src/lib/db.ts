// Server-only SQLite data layer (built-in node:sqlite, no native deps).
// The database file and uploaded images live in DATA_DIR (default: <project>/data),
// which is not tracked by git so deploys never touch live data.

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import type { SupabaseProduct, SupabaseContact, SupabaseReview, SupabaseHeroSlide, EmployeeCard } from './types';
import { type Category, hiddenKeys } from './categories';

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name_lv TEXT NOT NULL DEFAULT '',
  name_ru TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  install_price REAL NOT NULL DEFAULT 0,
  power_kw REAL NOT NULL DEFAULT 0,
  area_coverage TEXT NOT NULL DEFAULT '',
  energy_class TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'home',
  brand_color TEXT NOT NULL DEFAULT '',
  in_stock INTEGER NOT NULL DEFAULT 1,
  is_hit INTEGER NOT NULL DEFAULT 0,
  is_promo INTEGER NOT NULL DEFAULT 0,
  discount_percent REAL,
  description_lv TEXT NOT NULL DEFAULT '',
  description_ru TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  specs TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL DEFAULT '',
  text_lv TEXT NOT NULL DEFAULT '',
  text_ru TEXT NOT NULL DEFAULT '',
  text_en TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS employees_cards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  photo_position INTEGER NOT NULL DEFAULT 50,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS auth (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

// Survive Next.js dev hot-reload without leaking connections
const g = globalThis as unknown as { __aircomfortDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!g.__aircomfortDb) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const instance = new DatabaseSync(path.join(DATA_DIR, 'aircomfort.db'));
    instance.exec('PRAGMA journal_mode = WAL;');
    instance.exec(SCHEMA);
    migrate(instance);
    g.__aircomfortDb = instance;
  }
  return g.__aircomfortDb;
}

// Additive, idempotent schema migrations for databases created by older code
// (the live DB on the server). Never drops or rewrites existing data.
function migrate(instance: DatabaseSync) {
  const cols = instance.prepare('PRAGMA table_info(products)').all().map((c) => c.name as string);
  if (!cols.includes('updated_at')) {
    instance.exec('ALTER TABLE products ADD COLUMN updated_at TEXT');
    instance.exec('UPDATE products SET updated_at = created_at WHERE updated_at IS NULL');
  }

  // Versioned migrations (PRAGMA user_version). A full copy of the database is
  // written next to it before the first pending migration runs.
  const version = Number(instance.prepare('PRAGMA user_version').get()?.user_version ?? 0);
  if (version < 1) {
    backupBeforeMigration(instance, version);
    instance.exec('BEGIN');
    try {
      migrateV1(instance, cols);
      instance.exec('PRAGMA user_version = 1');
      instance.exec('COMMIT');
    } catch (e) {
      instance.exec('ROLLBACK');
      throw e;
    }
  }
}

function backupBeforeMigration(instance: DatabaseSync, version: number) {
  const hasData = Number(instance.prepare('SELECT COUNT(*) n FROM products').get()?.n ?? 0) > 0;
  if (!hasData) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(DATA_DIR, `aircomfort.db.bak-v${version}-${stamp}`);
  instance.prepare('VACUUM INTO ?').run(file);
  console.log(`[db] backup before migration written to ${file}`);
}

/**
 * v1: category tree + compatible products.
 * Rollback: DROP TABLE categories; ALTER TABLE products DROP COLUMN compatible_ids;
 *           PRAGMA user_version = 0;  (or restore the aircomfort.db.bak-v0-* copy)
 */
function migrateV1(instance: DatabaseSync, productCols: string[]) {
  instance.exec(`
CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  parent_key TEXT,
  slug TEXT NOT NULL UNIQUE,
  name_lv TEXT NOT NULL DEFAULT '',
  name_ru TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  is_system INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  seo_title_lv TEXT NOT NULL DEFAULT '', seo_title_ru TEXT NOT NULL DEFAULT '', seo_title_en TEXT NOT NULL DEFAULT '',
  seo_description_lv TEXT NOT NULL DEFAULT '', seo_description_ru TEXT NOT NULL DEFAULT '', seo_description_en TEXT NOT NULL DEFAULT '',
  seo_h1_lv TEXT NOT NULL DEFAULT '', seo_h1_ru TEXT NOT NULL DEFAULT '', seo_h1_en TEXT NOT NULL DEFAULT '',
  seo_intro_lv TEXT NOT NULL DEFAULT '', seo_intro_ru TEXT NOT NULL DEFAULT '', seo_intro_en TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);`);
  if (!productCols.includes('compatible_ids')) {
    instance.exec("ALTER TABLE products ADD COLUMN compatible_ids TEXT NOT NULL DEFAULT '[]'");
  }
  const insert = instance.prepare(`INSERT OR IGNORE INTO categories
    (key, parent_key, slug, name_lv, name_ru, name_en, sort_order, is_visible, is_system,
     seo_title_lv, seo_title_ru, seo_title_en, seo_description_lv, seo_description_ru, seo_description_en,
     seo_h1_lv, seo_h1_ru, seo_h1_en, seo_intro_lv, seo_intro_ru, seo_intro_en)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const c of SEED_CATEGORIES) {
    insert.run(
      c.key, c.parent ?? null, c.slug, c.lv, c.ru, c.en, c.sort, c.visible ? 1 : 0, c.system ? 1 : 0,
      c.seo?.title.lv ?? '', c.seo?.title.ru ?? '', c.seo?.title.en ?? '',
      c.seo?.desc.lv ?? '', c.seo?.desc.ru ?? '', c.seo?.desc.en ?? '',
      c.seo?.h1.lv ?? '', c.seo?.h1.ru ?? '', c.seo?.h1.en ?? '',
      c.seo?.intro.lv ?? '', c.seo?.intro.ru ?? '', c.seo?.intro.en ?? '',
    );
  }
}

type L3 = { lv: string; ru: string; en: string };
type SeedCat = {
  key: string; parent?: string; slug: string; lv: string; ru: string; en: string;
  sort: number; visible: boolean; system?: boolean;
  seo?: { title: L3; desc: L3; h1: L3; intro: L3 };
};

// Fan coils start hidden: the owner switches them on in Admin → Categories
// once there are products, so the live site never shows an empty section.
const fanSeo = (lv: string, ru: string, en: string, lvIn: string, ruIn: string, enIn: string) => ({
  title: { lv: `${lv} — cenas un montāža`, ru: `${ru} — цены и монтаж`, en: `${en} — prices & installation` },
  desc: {
    lv: `${lv} ūdens apkures un dzesēšanas sistēmām ar siltumsūkni gaiss-ūdens. Izvēle pēc jaudas, montāža visā Latvijā, bezmaksas konsultācija.`,
    ru: `${ru} для водяных систем отопления и охлаждения с тепловым насосом воздух-вода. Подбор по мощности, монтаж по всей Латвии, бесплатная консультация.`,
    en: `${en} for hydronic heating and cooling with an air-to-water heat pump. Sized to your rooms, installed anywhere in Latvia, free advice.`,
  },
  h1: { lv, ru, en },
  intro: { lv: lvIn, ru: ruIn, en: enIn },
});

const SEED_CATEGORIES: SeedCat[] = [
  { key: 'home', slug: 'home-air-conditioners', lv: 'Mājas kondicionieri', ru: 'Домашние кондиционеры', en: 'Home Air Conditioners', sort: 10, visible: true, system: true },
  { key: 'heat_pump', slug: 'air-to-air-heat-pumps', lv: 'Siltumsūkņi gaiss-gaiss', ru: 'Тепловые насосы воздух-воздух', en: 'Heat Pumps Air-to-Air', sort: 20, visible: true, system: true },
  { key: 'commercial', slug: 'commercial-air-conditioning', lv: 'Komerciālā klimatizācija', ru: 'Промышленная климатизация', en: 'Commercial HVAC', sort: 30, visible: true, system: true },
  { key: 'commercial_heat_pump', slug: 'air-to-water-heat-pumps', lv: 'Siltumsūkņi gaiss-ūdens', ru: 'Тепловые насосы воздух-вода', en: 'Heat Pumps Air-to-Water', sort: 40, visible: true, system: true },
  {
    key: 'fan_coils', slug: 'fan-coils', lv: 'Fankoili', ru: 'Фанкоилы', en: 'Fan coil units', sort: 50, visible: false,
    seo: fanSeo('Fankoili', 'Фанкоилы', 'Fan coil units',
      'Fankoils ir iekšējais bloks, kas silda vai dzesē telpu ar ūdeni no siltumsūkņa gaiss-ūdens vai katla. Piedāvājam kasešu, kanālu, sienas un grīdas-griestu modeļus 2 un 4 cauruļu sistēmām.',
      'Фанкойл — внутренний блок, который обогревает или охлаждает помещение водой от теплового насоса воздух-вода или котла. Подберём кассетные, канальные, настенные и напольно-потолочные модели для 2- и 4-трубных систем.',
      'A fan coil is an indoor unit that heats or cools a room with water from an air-to-water heat pump or boiler. We supply cassette, ducted, wall-mounted and floor-ceiling models for 2- and 4-pipe systems.'),
  },
  {
    key: 'fan_coils_cassette', parent: 'fan_coils', slug: 'fan-coils-cassette', lv: 'Kasešu', ru: 'Кассетные', en: 'Cassette', sort: 10, visible: true,
    seo: fanSeo('Kasešu fankoili', 'Кассетные фанкоилы', 'Cassette fan coils',
      'Kasešu fankoili tiek iebūvēti piekaramajos griestos un vienmērīgi sadala gaisu četros virzienos — piemēroti birojiem, veikaliem un plašām telpām.',
      'Кассетные фанкойлы встраиваются в подвесной потолок и равномерно распределяют воздух в четыре стороны — подходят для офисов, магазинов и больших помещений.',
      'Cassette fan coils are built into suspended ceilings and spread air evenly in four directions — a good fit for offices, shops and large rooms.'),
  },
  {
    key: 'fan_coils_ducted', parent: 'fan_coils', slug: 'fan-coils-ducted', lv: 'Kanālu', ru: 'Канальные', en: 'Ducted', sort: 20, visible: true,
    seo: fanSeo('Kanālu fankoili', 'Канальные фанкоилы', 'Ducted fan coils',
      'Kanālu fankoili tiek paslēpti aiz griestiem, un gaiss pa kanāliem tiek novadīts uz vienu vai vairākām telpām. Svarīgs parametrs ir ārējais statiskais spiediens.',
      'Канальные фанкойлы прячутся за потолком, а воздух по воздуховодам подаётся в одно или несколько помещений. Важный параметр — внешний статический напор.',
      'Ducted fan coils are hidden above the ceiling and deliver air through ducts to one or several rooms. External static pressure is the key parameter.'),
  },
  {
    key: 'fan_coils_wall', parent: 'fan_coils', slug: 'fan-coils-wall', lv: 'Sienas', ru: 'Настенные', en: 'Wall-mounted', sort: 30, visible: true,
    seo: fanSeo('Sienas fankoili', 'Настенные фанкоилы', 'Wall-mounted fan coils',
      'Sienas fankoili izskatās kā parasta sadalītās sistēmas iekšējā iekārta un ir vienkāršākais risinājums dzīvokļiem un mājām ar siltumsūkni gaiss-ūdens.',
      'Настенные фанкойлы похожи на внутренний блок обычной сплит-системы — самое простое решение для квартир и домов с тепловым насосом воздух-вода.',
      'Wall-mounted fan coils look like a regular split-system indoor unit — the simplest option for flats and houses with an air-to-water heat pump.'),
  },
  {
    key: 'fan_coils_floor_ceiling', parent: 'fan_coils', slug: 'fan-coils-floor-ceiling', lv: 'Grīdas-griestu', ru: 'Напольно-потолочные', en: 'Floor-ceiling', sort: 40, visible: true,
    seo: fanSeo('Grīdas-griestu fankoili', 'Напольно-потолочные фанкоилы', 'Floor-ceiling fan coils',
      'Grīdas-griestu fankoilus var uzstādīt pie sienas pie grīdas vai zem griestiem — universāls variants telpām bez piekaramajiem griestiem.',
      'Напольно-потолочные фанкойлы можно установить у пола или под потолком — универсальный вариант для помещений без подвесного потолка.',
      'Floor-ceiling fan coils can be mounted low on the wall or under the ceiling — a versatile choice for rooms without a suspended ceiling.'),
  },
];

const bool = (v: unknown): boolean => v === 1 || v === true;

// (row mappers below take untyped SQLite rows)

function mapProduct(r: any): SupabaseProduct {
  let specs: Record<string, string> | undefined;
  if (r.specs) { try { specs = JSON.parse(r.specs); } catch { /* ignore */ } }
  let compatible_ids: string[] = [];
  try { compatible_ids = JSON.parse(r.compatible_ids || '[]'); } catch { /* ignore */ }
  return {
    ...r,
    features: JSON.parse(r.features || '[]'),
    specs,
    compatible_ids,
    in_stock: bool(r.in_stock),
    is_hit: bool(r.is_hit),
    is_promo: bool(r.is_promo),
  };
}

const mapReview = (r: any): SupabaseReview => ({ ...r, is_visible: bool(r.is_visible) });
const mapSlide = (r: any): SupabaseHeroSlide => ({ ...r, is_visible: bool(r.is_visible) });
const mapCard = (r: any): EmployeeCard => ({ ...r, is_active: bool(r.is_active) });

// ---------- products ----------

const PRODUCT_COLUMNS = [
  'name_lv', 'name_ru', 'name_en', 'brand', 'price', 'install_price', 'power_kw',
  'area_coverage', 'energy_class', 'features', 'image_url', 'category', 'brand_color',
  'in_stock', 'is_hit', 'is_promo', 'discount_percent',
  'description_lv', 'description_ru', 'description_en', 'specs', 'compatible_ids',
] as const;

function serializeProduct(payload: Record<string, unknown>): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const col of PRODUCT_COLUMNS) {
    if (!(col in payload)) continue;
    const v = payload[col];
    if (col === 'features' || col === 'compatible_ids') out[col] = JSON.stringify(Array.isArray(v) ? v : []);
    else if (col === 'specs') out[col] = v ? JSON.stringify(v) : null;
    else if (typeof v === 'boolean') out[col] = v ? 1 : 0;
    else out[col] = (v as string | number | null) ?? null;
  }
  return out;
}

export async function listProducts(opts: { inStockOnly?: boolean; orderBy?: 'price' | 'newest' } = {}): Promise<SupabaseProduct[]> {
  const where = opts.inStockOnly ? 'WHERE in_stock = 1' : '';
  const order = opts.orderBy === 'price' ? 'ORDER BY price ASC' : 'ORDER BY created_at DESC';
  return db().prepare(`SELECT * FROM products ${where} ${order}`).all().map(mapProduct);
}

export async function getProduct(id: string): Promise<SupabaseProduct | null> {
  const row = db().prepare('SELECT * FROM products WHERE id = ?').get(id);
  return row ? mapProduct(row) : null;
}

export async function createProduct(payload: Record<string, unknown>): Promise<SupabaseProduct> {
  const data = serializeProduct(payload);
  const id = randomUUID();
  data.updated_at = new Date().toISOString();
  const cols = Object.keys(data);
  db().prepare(
    `INSERT INTO products (id${cols.map(c => `, ${c}`).join('')}) VALUES (?${', ?'.repeat(cols.length)})`
  ).run(id, ...cols.map(c => data[c]));
  return (await getProduct(id))!;
}

export async function updateProduct(id: string, payload: Record<string, unknown>): Promise<SupabaseProduct | null> {
  const data = serializeProduct(payload);
  if (Object.keys(data).length) data.updated_at = new Date().toISOString();
  const cols = Object.keys(data);
  if (cols.length) {
    db().prepare(`UPDATE products SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`)
      .run(...cols.map(c => data[c]), id);
  }
  return getProduct(id);
}

export async function deleteProduct(id: string): Promise<void> {
  db().prepare('DELETE FROM products WHERE id = ?').run(id);
}

// ---------- categories ----------

const mapCategory = (r: any): Category => ({ ...r, is_visible: bool(r.is_visible), is_system: bool(r.is_system) });

const CATEGORY_COLUMNS = [
  'parent_key', 'slug', 'name_lv', 'name_ru', 'name_en', 'sort_order', 'is_visible', 'image_url',
  'seo_title_lv', 'seo_title_ru', 'seo_title_en', 'seo_description_lv', 'seo_description_ru', 'seo_description_en',
  'seo_h1_lv', 'seo_h1_ru', 'seo_h1_en', 'seo_intro_lv', 'seo_intro_ru', 'seo_intro_en',
] as const;

export function listCategories(): Category[] {
  return db().prepare('SELECT * FROM categories ORDER BY sort_order, key').all().map(mapCategory);
}

export function getCategory(key: string): Category | null {
  const row = db().prepare('SELECT * FROM categories WHERE key = ?').get(key);
  return row ? mapCategory(row) : null;
}

export function getCategoryBySlug(slug: string): Category | null {
  const row = db().prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  return row ? mapCategory(row) : null;
}

/** Product count per category key (direct assignments only). */
export function categoryProductCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of db().prepare('SELECT category, COUNT(*) n FROM products GROUP BY category').all()) {
    out[r.category as string] = Number(r.n);
  }
  return out;
}

/** Keys of categories hidden on the public site (hidden parent hides children). */
export function hiddenCategoryKeys(): Set<string> {
  return hiddenKeys(listCategories());
}

function categoryValues(patch: Record<string, unknown>) {
  const out: Record<string, string | number | null> = {};
  for (const col of CATEGORY_COLUMNS) {
    if (!(col in patch)) continue;
    const v = patch[col];
    if (col === 'is_visible') out[col] = v ? 1 : 0;
    else if (col === 'sort_order') out[col] = Number(v) || 0;
    else if (col === 'parent_key') out[col] = (v as string) || null;
    else out[col] = String(v ?? '');
  }
  return out;
}

export function createCategory(key: string, patch: Record<string, unknown>): Category {
  const data = categoryValues(patch);
  const cols = Object.keys(data);
  db().prepare(`INSERT INTO categories (key${cols.map((c) => `, ${c}`).join('')}) VALUES (?${', ?'.repeat(cols.length)})`)
    .run(key, ...cols.map((c) => data[c]));
  return getCategory(key)!;
}

export function updateCategory(key: string, patch: Record<string, unknown>): Category | null {
  const data = categoryValues(patch);
  const cols = Object.keys(data);
  if (cols.length) {
    db().prepare(`UPDATE categories SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE key = ?`).run(...cols.map((c) => data[c]), key);
  }
  return getCategory(key);
}

export function deleteCategory(key: string): void {
  db().prepare('DELETE FROM categories WHERE key = ? AND is_system = 0').run(key);
}

// ---------- settings ----------

export async function getSettings(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const r of db().prepare('SELECT key, value FROM settings').all()) {
    map[r.key as string] = r.value as string;
  }
  return map;
}

export async function getSettingsRows(): Promise<{ key: string; value: string }[]> {
  return db().prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
}

export async function upsertSettings(rows: { key: string; value: string }[]): Promise<void> {
  const stmt = db().prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const { key, value } of rows) stmt.run(key, String(value ?? ''));
}

// ---------- hero slides ----------

export async function getHeroSlides(): Promise<string[]> {
  return db().prepare('SELECT image_url FROM hero_slides WHERE is_visible = 1 ORDER BY sort_order ASC')
    .all().map(r => r.image_url as string);
}

export async function listHeroSlides(): Promise<SupabaseHeroSlide[]> {
  return db().prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC').all().map(mapSlide);
}

export async function createHeroSlide(imageUrl: string, sortOrder: number): Promise<void> {
  db().prepare('INSERT INTO hero_slides (image_url, sort_order, is_visible) VALUES (?, ?, 1)').run(imageUrl, sortOrder);
}

export async function updateHeroSlide(id: number, patch: { sort_order?: number; is_visible?: boolean }): Promise<void> {
  if (patch.sort_order !== undefined) db().prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?').run(patch.sort_order, id);
  if (patch.is_visible !== undefined) db().prepare('UPDATE hero_slides SET is_visible = ? WHERE id = ?').run(patch.is_visible ? 1 : 0, id);
}

export async function deleteHeroSlide(id: number): Promise<void> {
  db().prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
}

// ---------- reviews ----------

export async function listReviews(opts: { visibleOnly?: boolean; limit?: number } = {}): Promise<SupabaseReview[]> {
  const where = opts.visibleOnly ? 'WHERE is_visible = 1' : '';
  const limit = opts.limit ? `LIMIT ${Math.floor(opts.limit)}` : '';
  return db().prepare(`SELECT * FROM reviews ${where} ORDER BY created_at DESC ${limit}`).all().map(mapReview);
}

export async function createReview(r: { author_name: string; text_lv: string; text_ru: string; text_en: string; rating: number; is_visible: boolean }): Promise<void> {
  db().prepare('INSERT INTO reviews (author_name, text_lv, text_ru, text_en, rating, is_visible) VALUES (?, ?, ?, ?, ?, ?)')
    .run(r.author_name, r.text_lv ?? '', r.text_ru ?? '', r.text_en ?? '', r.rating ?? 5, r.is_visible ? 1 : 0);
}

export async function updateReview(id: number, patch: Partial<{ author_name: string; text_lv: string; text_ru: string; text_en: string; rating: number; is_visible: boolean }>): Promise<void> {
  const cols: string[] = [];
  const vals: (string | number)[] = [];
  for (const key of ['author_name', 'text_lv', 'text_ru', 'text_en', 'rating', 'is_visible'] as const) {
    if (patch[key] === undefined) continue;
    cols.push(`${key} = ?`);
    const v = patch[key];
    vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : (v as string | number));
  }
  if (cols.length) db().prepare(`UPDATE reviews SET ${cols.join(', ')} WHERE id = ?`).run(...vals, id);
}

export async function deleteReview(id: number): Promise<void> {
  db().prepare('DELETE FROM reviews WHERE id = ?').run(id);
}

// ---------- contacts ----------

export async function listContacts(): Promise<SupabaseContact[]> {
  return db().prepare('SELECT * FROM contacts ORDER BY created_at DESC').all() as unknown as SupabaseContact[];
}

export async function createContact(c: { name: string; phone: string; email: string; service: string; message: string }): Promise<void> {
  db().prepare("INSERT INTO contacts (name, phone, email, service, message, status) VALUES (?, ?, ?, ?, ?, 'new')")
    .run(c.name, c.phone, c.email ?? '', c.service ?? '', c.message ?? '');
}

export async function setContactStatus(id: number, status: string): Promise<void> {
  db().prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id);
}

export async function deleteContact(id: number): Promise<void> {
  db().prepare('DELETE FROM contacts WHERE id = ?').run(id);
}

// ---------- employee cards ----------

export async function listCards(): Promise<EmployeeCard[]> {
  return db().prepare('SELECT * FROM employees_cards ORDER BY created_at ASC').all().map(mapCard);
}

export async function getCardByToken(token: string): Promise<EmployeeCard | null> {
  const row = db().prepare('SELECT * FROM employees_cards WHERE token = ? AND is_active = 1').get(token);
  return row ? mapCard(row) : null;
}

export async function createCard(c: Record<string, unknown>): Promise<void> {
  db().prepare(
    'INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    randomUUID(),
    String(c.slug ?? ''),
    randomUUID().replace(/-/g, ''),
    String(c.name ?? ''), String(c.title ?? ''), String(c.phone ?? ''), String(c.email ?? ''),
    (c.photo_url as string) || null,
    Number(c.photo_position ?? 50),
    c.is_active === false ? 0 : 1,
  );
}

export async function updateCard(id: string, patch: Record<string, unknown>): Promise<void> {
  const cols: string[] = [];
  const vals: (string | number | null)[] = [];
  for (const key of ['slug', 'name', 'title', 'phone', 'email', 'photo_url', 'photo_position', 'is_active'] as const) {
    if (!(key in patch)) continue;
    cols.push(`${key} = ?`);
    const v = patch[key];
    vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : (v as string | number | null));
  }
  if (cols.length) db().prepare(`UPDATE employees_cards SET ${cols.join(', ')} WHERE id = ?`).run(...vals, id);
}

export async function deleteCard(id: string): Promise<void> {
  db().prepare('DELETE FROM employees_cards WHERE id = ?').run(id);
}

// ---------- auth secrets (separate from public settings) ----------

export function getAuthValue(key: string): string | null {
  const row = db().prepare('SELECT value FROM auth WHERE key = ?').get(key);
  return row ? (row.value as string) : null;
}

export function setAuthValue(key: string, value: string): void {
  db().prepare('INSERT INTO auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}
