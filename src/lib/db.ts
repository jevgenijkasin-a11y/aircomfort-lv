// Server-only SQLite data layer (built-in node:sqlite, no native deps).
// The database file and uploaded images live in DATA_DIR (default: <project>/data),
// which is not tracked by git so deploys never touch live data.

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import type { SupabaseProduct, SupabaseContact, SupabaseReview, SupabaseHeroSlide, EmployeeCard } from './types';

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
    g.__aircomfortDb = instance;
  }
  return g.__aircomfortDb;
}

const bool = (v: unknown): boolean => v === 1 || v === true;

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapProduct(r: any): SupabaseProduct {
  let specs: Record<string, string> | undefined;
  if (r.specs) { try { specs = JSON.parse(r.specs); } catch { /* ignore */ } }
  return {
    ...r,
    features: JSON.parse(r.features || '[]'),
    specs,
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
  'description_lv', 'description_ru', 'description_en', 'specs',
] as const;

function serializeProduct(payload: Record<string, unknown>): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const col of PRODUCT_COLUMNS) {
    if (!(col in payload)) continue;
    const v = payload[col];
    if (col === 'features') out[col] = JSON.stringify(v ?? []);
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
  const cols = Object.keys(data);
  db().prepare(
    `INSERT INTO products (id${cols.map(c => `, ${c}`).join('')}) VALUES (?${', ?'.repeat(cols.length)})`
  ).run(id, ...cols.map(c => data[c]));
  return (await getProduct(id))!;
}

export async function updateProduct(id: string, payload: Record<string, unknown>): Promise<SupabaseProduct | null> {
  const data = serializeProduct(payload);
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
