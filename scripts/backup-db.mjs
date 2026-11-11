// Daily backup of the SQLite database: a consistent copy made with VACUUM INTO
// (safe while the site is running), kept for 14 days.
//
//   node scripts/backup-db.mjs            → <DATA_DIR>/backups/aircomfort-YYYY-MM-DD.db
//   DATA_DIR=/path/to/data node scripts/backup-db.mjs
//
// Plesk → Scheduled Tasks → Run a command, daily (e.g. 03:30):
//   cd /var/www/vhosts/aircomfort.lv/httpdocs && node scripts/backup-db.mjs
// Uploaded photos (<DATA_DIR>/uploads) change rarely: include the data folder in
// Plesk → Backup Manager (weekly, stored off-server / FTP storage).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS || 14);
const src = path.join(DATA_DIR, 'aircomfort.db');
const dir = path.join(DATA_DIR, 'backups');

if (!fs.existsSync(src)) {
  console.error(`[backup] database not found: ${src}`);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const out = path.join(dir, `aircomfort-${stamp}.db`);
if (fs.existsSync(out)) fs.unlinkSync(out); // re-run on the same day replaces the copy

const db = new DatabaseSync(src, { readOnly: true });
db.prepare('VACUUM INTO ?').run(out);
db.close();
const size = fs.statSync(out).size;
console.log(`[backup] ${out} (${(size / 1024 / 1024).toFixed(1)} MB)`);

// Keep the last KEEP_DAYS copies
const old = Date.now() - KEEP_DAYS * 86_400_000;
for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f);
  if (/^aircomfort-\d{4}-\d{2}-\d{2}\.db$/.test(f) && fs.statSync(p).mtimeMs < old) {
    fs.unlinkSync(p);
    console.log(`[backup] removed ${f}`);
  }
}
