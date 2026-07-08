// One-time export of all Supabase data (tables + storage) before migrating to SQLite.
// Usage: node scripts/export-supabase.mjs
// Output: migration/tables/*.json and data/uploads/<bucket>/<file>

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const URL = 'https://yoffczlzqpzuejxiskum.supabase.co';
const envLocal = await fs.readFile('.env.local', 'utf-8');
const SERVICE_KEY = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY=(\S+)/)?.[1];
if (!SERVICE_KEY) { console.error('No service role key in .env.local'); process.exit(1); }

const sb = createClient(URL, SERVICE_KEY);

const TABLES = ['products', 'settings', 'hero_slides', 'contacts', 'reviews', 'employees_cards', 'leads'];

await fs.mkdir('migration/tables', { recursive: true });

for (const table of TABLES) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select('*').range(from, from + 999);
    if (error) { console.error(`[${table}]`, error.message); break; }
    rows.push(...data);
    if (data.length < 1000) break;
  }
  await fs.writeFile(`migration/tables/${table}.json`, JSON.stringify(rows, null, 2));
  console.log(`table ${table}: ${rows.length} rows`);
}

// Storage: enumerate all buckets, download everything
const { data: buckets, error: bErr } = await sb.storage.listBuckets();
if (bErr) { console.error('listBuckets:', bErr.message); process.exit(1); }

let totalFiles = 0, totalBytes = 0;
for (const bucket of buckets) {
  const dir = path.join('data', 'uploads', bucket.name);
  await fs.mkdir(dir, { recursive: true });

  // recursive list
  async function listAll(prefix) {
    const { data, error } = await sb.storage.from(bucket.name).list(prefix, { limit: 1000 });
    if (error) { console.error(`[${bucket.name}/${prefix}]`, error.message); return []; }
    const files = [];
    for (const item of data) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...await listAll(full)); // folder
      else files.push(full);
    }
    return files;
  }

  const files = await listAll('');
  console.log(`bucket ${bucket.name}: ${files.length} files`);
  for (const file of files) {
    const { data, error } = await sb.storage.from(bucket.name).download(file);
    if (error) { console.error(`  download ${file}:`, error.message); continue; }
    const buf = Buffer.from(await data.arrayBuffer());
    const dest = path.join(dir, file);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buf);
    totalFiles++; totalBytes += buf.length;
  }
}
console.log(`downloaded ${totalFiles} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
