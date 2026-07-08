// One-time import: migration/tables/*.json (Supabase export) -> data/aircomfort.db
// Rewrites Supabase Storage URLs to local /uploads/... paths.
// Generates a new admin password (stored as scrypt hash only) and prints it.
// Usage: node scripts/import-to-sqlite.mjs

import { DatabaseSync } from 'node:sqlite';
import { promises as fs } from 'fs';
import { randomBytes, randomUUID, scryptSync } from 'crypto';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || 'data';
const DB_PATH = path.join(DATA_DIR, 'aircomfort.db');
const STORAGE_PREFIX = 'https://yoffczlzqpzuejxiskum.supabase.co/storage/v1/object/public/';

const rewriteUrl = (u) => (typeof u === 'string' ? u.replaceAll(STORAGE_PREFIX, '/uploads/') : u);

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.rm(DB_PATH, { force: true });
await fs.rm(DB_PATH + '-wal', { force: true });
await fs.rm(DB_PATH + '-shm', { force: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`
CREATE TABLE products (
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
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
CREATE TABLE hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL DEFAULT '',
  text_lv TEXT NOT NULL DEFAULT '',
  text_ru TEXT NOT NULL DEFAULT '',
  text_en TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE employees_cards (
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
CREATE TABLE auth (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

const load = async (name) => JSON.parse(await fs.readFile(`migration/tables/${name}.json`, 'utf-8'));
const b = (v) => (v ? 1 : 0);

// products
const products = await load('products');
const insProduct = db.prepare(`INSERT INTO products
  (id, name_lv, name_ru, name_en, brand, price, install_price, power_kw, area_coverage, energy_class,
   features, image_url, category, brand_color, in_stock, is_hit, is_promo, discount_percent,
   description_lv, description_ru, description_en, specs, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const p of products) {
  insProduct.run(
    p.id, p.name_lv ?? '', p.name_ru ?? '', p.name_en ?? '', p.brand ?? '',
    p.price ?? 0, p.install_price ?? 0, p.power_kw ?? 0, p.area_coverage ?? '', p.energy_class ?? '',
    JSON.stringify(p.features ?? []), rewriteUrl(p.image_url ?? ''), p.category ?? 'home', p.brand_color ?? '',
    b(p.in_stock), b(p.is_hit), b(p.is_promo), p.discount_percent ?? null,
    p.description_lv ?? '', p.description_ru ?? '', p.description_en ?? '',
    p.specs && Object.keys(p.specs).length ? JSON.stringify(p.specs) : null,
    p.created_at ?? new Date().toISOString(),
  );
}
console.log(`products: ${products.length}`);

// settings (drop any legacy plain-text admin password)
const settings = (await load('settings')).filter((s) => s.key !== 'admin_password');
const insSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
for (const s of settings) insSetting.run(s.key, String(s.value ?? ''));
console.log(`settings: ${settings.length}`);

// hero slides
const slides = await load('hero_slides');
const insSlide = db.prepare('INSERT INTO hero_slides (id, image_url, sort_order, is_visible, created_at) VALUES (?, ?, ?, ?, ?)');
for (const s of slides) insSlide.run(s.id, rewriteUrl(s.image_url), s.sort_order ?? 0, b(s.is_visible), s.created_at);
console.log(`hero_slides: ${slides.length}`);

// contacts
const contacts = await load('contacts');
const insContact = db.prepare('INSERT INTO contacts (id, name, phone, email, service, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
for (const c of contacts) insContact.run(c.id, c.name ?? '', c.phone ?? '', c.email ?? '', c.service ?? '', c.message ?? '', c.status ?? 'new', c.created_at);
console.log(`contacts: ${contacts.length}`);

// reviews
const reviews = await load('reviews');
const insReview = db.prepare('INSERT INTO reviews (id, author_name, text_lv, text_ru, text_en, rating, is_visible, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
for (const r of reviews) insReview.run(r.id, r.author_name ?? '', r.text_lv ?? '', r.text_ru ?? '', r.text_en ?? '', r.rating ?? 5, b(r.is_visible), r.created_at);
console.log(`reviews: ${reviews.length}`);

// employee cards
const cards = await load('employees_cards');
const insCard = db.prepare('INSERT INTO employees_cards (id, slug, token, name, title, phone, email, photo_url, photo_position, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
for (const c of cards) {
  insCard.run(c.id, c.slug, c.token, c.name ?? '', c.title ?? '', c.phone ?? '', c.email ?? '',
    rewriteUrl(c.photo_url) || null, c.photo_position ?? 50, b(c.is_active), c.created_at);
}
console.log(`employees_cards: ${cards.length}`);

// auth: fresh admin password (hash only) + session secret
const password = randomBytes(9).toString('base64url');
const salt = randomBytes(16).toString('hex');
const hash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
const insAuth = db.prepare('INSERT INTO auth (key, value) VALUES (?, ?)');
insAuth.run('password_hash', hash);
insAuth.run('session_secret', randomBytes(32).toString('hex'));

await fs.writeFile('migration/admin-password.txt', `Admin password: ${password}\n`);
console.log('\nNEW ADMIN PASSWORD:', password);
console.log('(also saved to migration/admin-password.txt — not tracked by git)');

db.close();
console.log(`\nDone -> ${DB_PATH}`);
