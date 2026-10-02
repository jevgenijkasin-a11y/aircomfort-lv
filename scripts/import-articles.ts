// Imports blog articles from a folder of .md files with a YAML header:
//
//   ---
//   slug: valsts-atbalsts-siltumsuknim-2026
//   lang: lv
//   title: …
//   meta_title: …
//   meta_description: …
//   category: subsidy            (cooling | heating | subsidy)
//   related_catalog: /lv/catalog/type/air-to-water-heat-pumps
//   cover_idea: …
//   cover: /images/blog/<slug>-cover.webp   (optional, file in public/images/blog)
//   ---
//   # Title (dropped: the page H1 comes from `title`)
//   Markdown text…
//
// Files with the same slug are one article (one file per language). Articles
// are created / updated by slug through the admin API — the same validation as
// the admin panel. New articles are saved as drafts (is_published = false);
// existing ones keep their published state unless --unpublish is given.
// Languages missing in the folder are left as they are.
//
//   ADMIN_PASSWORD=… node scripts/import-articles.ts [--dir "C:\…\statji"]
//        [--base http://localhost:3000] [--apply] [--unpublish]
//
// Default is a dry run: prints what would be created / updated.
// (Node 22.18+ / 24 runs this TypeScript file directly.)
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (name: string): string | boolean | undefined => {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const base = (typeof arg('base') === 'string' ? (arg('base') as string) : 'http://localhost:3000').replace(/\/$/, '');
const dir = typeof arg('dir') === 'string' ? (arg('dir') as string) : 'C:\\Users\\Jevgenij\\Pictures\\Mycond-каталог\\statji';
const apply = arg('apply') === true;
const unpublish = arg('unpublish') === true;

const LANGS = ['lv', 'ru', 'en'];
const CATEGORIES = ['cooling', 'heating', 'subsidy'];

type Front = Record<string, string>;

/** "key: value" lines of the YAML header (flat strings, optional quotes). */
function parseFile(text: string): { front: Front; body: string } | null {
  const m = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const front: Front = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    front[kv[1]] = v;
  }
  // The H1 repeats `title`; the page renders the title itself
  const body = m[2].replace(/^\s*#\s+[^\n]*\n+/, '').trim();
  return { front, body };
}

// ── read the folder ───────────────────────────────────────────────────
type Draft = Record<string, unknown> & { slug: string };
const bySlug = new Map<string, Draft>();
const problems: string[] = [];

const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.md'));
for (const f of files) {
  const parsed = parseFile(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (!parsed) { console.log(`skip ${f}: no YAML header`); continue; }
  const { front, body } = parsed;
  const lang = (front.lang || f.match(/\.(lv|ru|en)\.md$/i)?.[1] || '').toLowerCase();
  if (!front.slug) { problems.push(`${f}: no slug`); continue; }
  if (!LANGS.includes(lang)) { problems.push(`${f}: unknown lang "${front.lang ?? ''}"`); continue; }
  if (!CATEGORIES.includes(front.category)) { problems.push(`${f}: unknown category "${front.category ?? ''}"`); continue; }
  if (!front.title || !body) { problems.push(`${f}: empty title or text`); continue; }

  const d: Draft = bySlug.get(front.slug) ?? { slug: front.slug };
  if (d.category && d.category !== front.category) problems.push(`${f}: category "${front.category}" differs from the other language ("${d.category}")`);
  d.category = front.category;
  if (front.related_catalog) d.related_catalog = front.related_catalog;
  // Optional cover: a site path such as /images/blog/<slug>-cover.webp
  if (front.cover) d.cover_url = front.cover;
  // Cover idea: the Russian one (admin language) wins, else the first found
  if (front.cover_idea && (lang === 'ru' || !d.cover_idea)) d.cover_idea = front.cover_idea;
  d[`title_${lang}`] = front.title;
  d[`meta_title_${lang}`] = front.meta_title ?? '';
  d[`meta_description_${lang}`] = front.meta_description ?? '';
  d[`body_${lang}`] = body;
  d.__langs = [...((d.__langs as string[]) ?? []), lang];
  d.__files = [...((d.__files as string[]) ?? []), f];
  bySlug.set(front.slug, d);
}

if (problems.length) {
  console.log('Problems:\n  ' + problems.join('\n  '));
}

// ── admin API ─────────────────────────────────────────────────────────
const password = process.env.ADMIN_PASSWORD || '';
if (!password) throw new Error('Set ADMIN_PASSWORD to log in to the admin API.');
const login = await fetch(`${base}/api/admin/auth`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
});
if (!login.ok) throw new Error(`Admin login failed at ${base} (HTTP ${login.status}).`);
const cookie = (login.headers.get('set-cookie') || '').split(';')[0];

async function call<T>(p: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`${base}${p}`, {
    ...rest,
    headers: { cookie, ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${p} → HTTP ${res.status}: ${(data as { error?: string }).error || ''}`);
  return data as T;
}

type Existing = { id: number; slug: string; is_published: boolean };
const existing = new Map((await call<Existing[]>('/api/admin/articles')).map((a) => [a.slug, a]));

console.log(`${apply ? 'APPLY' : 'DRY RUN'} — ${base}\nFolder: ${dir}\n`);
let created = 0, updated = 0, failed = 0;
for (const d of bySlug.values()) {
  const { __langs, __files, ...payload } = d;
  const was = existing.get(d.slug);
  const langs = (__langs as string[]).join('+');
  if (!was) {
    console.log(`+ create  ${d.slug}  [${langs}] ${d.category}  (draft)`);
    if (apply) {
      try { await call('/api/admin/articles', { method: 'POST', json: { ...payload, is_published: false } }); created++; }
      catch (e) { failed++; console.log(`  ! ${(e as Error).message}`); }
    }
  } else {
    const pub = unpublish ? false : was.is_published;
    console.log(`~ update  ${d.slug}  [${langs}] ${d.category}  (${pub ? 'stays published' : 'draft'})`);
    if (apply) {
      try { await call(`/api/admin/articles/${was.id}`, { method: 'PUT', json: unpublish ? { ...payload, is_published: false } : payload }); updated++; }
      catch (e) { failed++; console.log(`  ! ${(e as Error).message}`); }
    }
  }
}

if (apply) {
  await call('/api/admin/revalidate', { method: 'POST' });
  console.log(`\nDone: ${created} created, ${updated} updated, ${failed} failed.`);
} else {
  console.log(`\n${bySlug.size} article(s) from ${files.length} file(s). Run again with --apply to save.`);
}
