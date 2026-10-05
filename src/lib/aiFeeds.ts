// Files for AI crawlers and feed readers: robots.txt, llms.txt, llms-full.txt
// and the blog RSS feeds. Everything comes from the database (published
// articles, visible categories, products in stock) — nothing is hard-coded.
import { listProducts, listCategories } from './db';
import { categoryTree, hiddenKeys, catName, type Category } from './categories';
import { visibleProducts, pricedFirst } from './catalogData';
import { BASE_URL } from './seo';
import { CATEGORY_MSG_KEY, productHeading, finalPrice, areaLabel, roomCount } from './productSeo';
import { type Article, type Loc, ARTICLE_LOCALES, excerpt, leadParagraphs } from './articles';
import { publishedArticles, publishedDate } from './blogData';
import type { SupabaseProduct } from './types';

export const TEXT_HEADERS = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' };
export const RSS_HEADERS = { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' };

// ── robots.txt ────────────────────────────────────────────────────────

/** Paths closed to every crawler, AI bots included. */
const DISALLOW = ['/admin', '/api/', '/card/'];

/** AI crawlers: allowed for search and AI answers (Content-Signal says no training). */
export const AI_BOTS = [
  'GPTBot', 'ClaudeBot', 'Claude-Web', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended',
  'Amazonbot', 'YouBot', 'CCBot', 'cohere-ai', 'Applebot-Extended', 'DuckAssistBot',
  'Bytespider', 'Meta-ExternalAgent',
];

/**
 * A crawler with its own group ignores the "User-agent: *" rules, so every
 * group repeats the same Disallow lines.
 */
export function robotsTxt(): string {
  const group = (agent: string) => [`User-agent: ${agent}`, 'Allow: /', ...DISALLOW.map((p) => `Disallow: ${p}`)].join('\n');
  return [
    group('*'),
    '# AI crawlers - allowed for search and ai-input, not for training',
    ...AI_BOTS.map(group),
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    `Sitemap: ${BASE_URL}/sitemap.xml\nHost: ${BASE_URL}`,
  ].join('\n\n') + '\n';
}

// ── shared data ───────────────────────────────────────────────────────

type Messages = { categories: Record<string, string>; blog: Record<string, string> };
const messages = async (l: Loc): Promise<Messages> => (await import(`../messages/${l}.json`)).default;

const url = (l: Loc, path = '') => `${BASE_URL}/${l}${path}`;
const LANG_NAME: Record<Loc, string> = { lv: 'Latviešu', ru: 'Русский', en: 'English' };

/** Visible categories as a tree, with their in-stock products (empty ones left out, like in the sitemap). */
async function catalogTree() {
  const cats = listCategories();
  const hidden = hiddenKeys(cats);
  const products = pricedFirst(visibleProducts(await listProducts({ inStockOnly: true, orderBy: 'price' }), hidden));
  const own = (c: Category) => products.filter((p) => p.category === c.key);
  const msgs = Object.fromEntries(await Promise.all(ARTICLE_LOCALES.map(async (l) => [l, await messages(l)]))) as Record<Loc, Messages>;
  // System categories take their public names from the site texts
  const name = (c: Category, l: Loc) => (c.is_system && CATEGORY_MSG_KEY[c.key] ? msgs[l].categories[CATEGORY_MSG_KEY[c.key]] : '') || catName(c, l);
  const path = (c: Category) => (c.is_system ? `/catalog/type/${c.slug}` : `/catalog/category/${c.slug}`);
  const node = (c: Category) => ({ cat: c, name: (l: Loc) => name(c, l), path: path(c), products: own(c) });
  const tree = categoryTree(cats)
    .filter(({ cat }) => !hidden.has(cat.key))
    .map(({ cat, children }) => ({ ...node(cat), children: children.filter((ch) => !hidden.has(ch.key)).map(node).filter((ch) => ch.products.length) }))
    .filter((n) => n.products.length || n.children.length);
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b));
  return { tree, brands, msgs, count: products.length };
}

type Tree = Awaited<ReturnType<typeof catalogTree>>['tree'];

/** Published articles per language (only the languages they are written in). */
const articlesByLocale = () => Object.fromEntries(ARTICLE_LOCALES.map((l) => [l, publishedArticles(l)])) as Record<Loc, Article[]>;
const articleDesc = (a: Article, l: Loc) => a[`meta_description_${l}`]?.trim() || excerpt(a[`body_${l}`], 160);
const articleUrl = (a: Article, l: Loc) => url(l, `/blog/${a.slug}`);

// ── llms.txt ──────────────────────────────────────────────────────────

const intro = (brands: string) => `# AirComfort.lv — llms.txt
# Structured site description for AI crawlers and language models.
# https://llmstxt.org

---

## Latviešu

# AirComfort.lv

> Klimatiekārtu piegāde, uzstādīšana un apkope Latvijā

AirComfort.lv ir Latvijas uzņēmums, kas nodarbojas ar gaisa kondicionieru un siltumsūkņu pārdošanu, profesionālu uzstādīšanu un apkopi privātpersonām un uzņēmumiem visā Latvijā.

### Pakalpojumi

- **Pārdošana** — plašs kondicionēšanas iekārtu klāsts no vadošajiem ražotājiem
- **Uzstādīšana** — profesionāla montāža no 1 dienas, 3 gadu garantija
- **Apkope** — regulārs serviss, tīrīšana un remonts, ātra reaģēšana
- **Konsultācija** — bezmaksas konsultācija un optimālā risinājuma izvēle

### Zīmoli

${brands}

### Kontakti

- Vietne: https://aircomfort.lv/lv
- E-pasts: info@aircomfort.lv
- Tālrunis: +371 28828400
- Atrašanās vieta: Rīga, Latvija
- Darba laiks: Pirmdiena–Piektdiena 9:00–18:00

### Valodu versijas

- **Latviešu** (galvenā): https://aircomfort.lv/lv
- Krievu: https://aircomfort.lv/ru
- Angļu: https://aircomfort.lv/en

---

## Русский

# AirComfort.lv

> Продажа, монтаж и обслуживание кондиционеров и тепловых насосов в Латвии

AirComfort.lv — латвийская компания: продажа, профессиональный монтаж и обслуживание кондиционеров и тепловых насосов для частных клиентов и компаний по всей Латвии.

### Услуги

- **Продажа** — широкий выбор климатической техники ведущих производителей
- **Монтаж** — профессиональная установка от 1 дня, гарантия 3 года
- **Обслуживание** — регулярный сервис, чистка и ремонт, быстрый выезд
- **Консультация** — бесплатная консультация и подбор оптимального решения

### Бренды

${brands}

### Контакты

- Сайт: https://aircomfort.lv/ru
- E-mail: info@aircomfort.lv
- Телефон: +371 28828400
- Местоположение: Рига, Латвия
- Время работы: понедельник–пятница 9:00–18:00

---

## English

# AirComfort.lv

> Air conditioner supply, installation and maintenance in Latvia

AirComfort.lv is a Latvian company specialising in the sale, professional installation and maintenance of air conditioning systems and heat pumps for residential and commercial customers throughout Latvia.

### Services

- **Supply**: Wide range of air conditioning equipment from leading brands
- **Installation**: Professional installation with a 3-year warranty, all work completed in one day
- **Maintenance**: Regular servicing, cleaning and repairs, fast response
- **Consultation**: Free consultation and selection of the optimal solution for your space

### Brands

${brands}

### Contact

- Website: https://aircomfort.lv/en
- Email: info@aircomfort.lv
- Phone: +371 28828400
- Location: Riga, Latvia
- Working hours: Mon–Fri 9:00–18:00

### Language Versions

- **Latvian** (primary): https://aircomfort.lv/lv
- Russian: https://aircomfort.lv/ru
- English: https://aircomfort.lv/en
`;

/** "[Mājas kondicionieri](…/lv/…) · [Домашние кондиционеры](…/ru/…) · [Home Air Conditioners](…/en/…)" */
const threeLinks = (name: (l: Loc) => string, path: string) => ARTICLE_LOCALES.map((l) => `[${name(l)}](${url(l, path)})`).join(' · ');

function catalogSection(tree: Tree, count: number): string {
  const lines = [`## Katalogs / Каталог / Catalog`, '', `${count} products in stock. Links: Latvian · Russian · English.`, ''];
  for (const n of tree) {
    const total = n.products.length + n.children.reduce((s, ch) => s + ch.products.length, 0);
    lines.push(`- ${threeLinks(n.name, n.path)} — ${total}`);
    for (const ch of n.children) lines.push(`  - ${threeLinks(ch.name, ch.path)} — ${ch.products.length}`);
  }
  return lines.join('\n');
}

function subsidySection(byLoc: Record<Loc, Article[]>): string {
  const items = ARTICLE_LOCALES.flatMap((l) => byLoc[l].filter((a) => a.category === 'subsidy').map((a) => `- [${a[`title_${l}`]}](${articleUrl(a, l)}): ${articleDesc(a, l)}`));
  if (!items.length) return '';
  return [
    '## Valsts atbalsts siltumsūkņiem (EKII) / Господдержка на тепловые насосы (EKII) / State subsidy for heat pumps (EKII)',
    '',
    'Latvian state support programme (EKII) for heat pumps; current conditions are in the article.',
    '',
    ...items,
  ].join('\n');
}

function guidesSection(byLoc: Record<Loc, Article[]>): string {
  const parts = ARTICLE_LOCALES.filter((l) => byLoc[l].length).map((l) =>
    [`### ${LANG_NAME[l]}`, '', ...byLoc[l].map((a) => `- [${a[`title_${l}`]}](${articleUrl(a, l)}): ${articleDesc(a, l)}`)].join('\n'));
  return parts.length ? ['## Padomi / Полезное / Guides', ...parts].join('\n\n') : '';
}

function feedsSection(msgs: Record<Loc, Messages>, byLoc: Record<Loc, Article[]>): string {
  return [
    '## Feeds / Plūsmas / Ленты',
    '',
    ...ARTICLE_LOCALES.filter((l) => byLoc[l].length).map((l) => `- [RSS — ${msgs[l].blog.metaTitle} (${l})](${url(l, '/blog/rss.xml')})`),
    `- [Sitemap](${BASE_URL}/sitemap.xml)`,
    `- [llms-full.txt](${BASE_URL}/llms-full.txt): full catalog of products in stock (prices, power, area, energy class, SEER/SCOP, noise) and article summaries`,
  ].join('\n');
}

export async function llmsTxt(): Promise<string> {
  const { tree, brands, msgs, count } = await catalogTree();
  const byLoc = articlesByLocale();
  return [intro(brands.join(', ')).trimEnd(), catalogSection(tree, count), subsidySection(byLoc), guidesSection(byLoc), feedsSection(msgs, byLoc)]
    .filter(Boolean)
    .join('\n\n---\n\n') + '\n';
}

// ── llms-full.txt ─────────────────────────────────────────────────────

const money = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`;
const spec = (p: SupabaseProduct, k: string) => String(p.specs?.[k] ?? '').trim();

/** One product: name, then the facts that are filled, then the links. */
function productLine(p: SupabaseProduct): string {
  const price = finalPrice(p);
  const area = areaLabel(p, 'en');
  const rooms = roomCount(p);
  const seer = spec(p, 'seer'), scop = spec(p, 'scop'), noise = spec(p, 'noise_db');
  const facts = [
    `brand ${p.brand}`,
    price ? `price ${money(price)}${p.discount_percent ? ` (−${p.discount_percent}%, was ${money(p.price)})` : ''}` : 'price on request',
    p.power_kw > 0 ? `${p.power_kw} kW` : '',
    area ? `area ${area} m²` : rooms ? `${rooms} rooms` : '',
    p.energy_class ? `energy class ${p.energy_class}` : '',
    [seer && `SEER ${seer}`, scop && `SCOP ${scop}`].filter(Boolean).join(' / '),
    noise ? `noise ${noise} dB(A)` : '',
  ].filter(Boolean);
  const link = (l: Loc) => url(l, `/catalog/${p.id}`);
  return `- ${productHeading(p, 'lv')} — ${facts.join(', ')} — ${link('lv')} (ru: ${link('ru')}, en: ${link('en')})`;
}

function productsSection(tree: Tree): string {
  const lines = [
    '## Products in stock / Preces / Товары',
    '',
    'Prices in EUR for the equipment; installation is quoted separately. Links: Latvian page first, Russian and English versions in brackets.',
  ];
  for (const n of tree) {
    lines.push('', `### ${n.name('lv')} / ${n.name('ru')} / ${n.name('en')}`, `${url('lv', n.path)}`);
    if (n.products.length) lines.push('', ...n.products.map(productLine));
    for (const ch of n.children) {
      lines.push('', `#### ${ch.name('lv')} / ${ch.name('ru')} / ${ch.name('en')}`, `${url('lv', ch.path)}`, '', ...ch.products.map(productLine));
    }
  }
  return lines.join('\n');
}

function articleSummaries(byLoc: Record<Loc, Article[]>): string {
  const parts = ARTICLE_LOCALES.filter((l) => byLoc[l].length).map((l) =>
    [`### ${LANG_NAME[l]}`, ...byLoc[l].map((a) => [`#### ${a[`title_${l}`]}`, ...leadParagraphs(a[`body_${l}`], 3), `Full article: ${articleUrl(a, l)}`].join('\n\n'))].join('\n\n'));
  return parts.length ? ['## Article summaries / Rakstu kopsavilkumi / Кратко о статьях', ...parts].join('\n\n') : '';
}

export async function llmsFullTxt(): Promise<string> {
  const { tree } = await catalogTree();
  const byLoc = articlesByLocale();
  return [(await llmsTxt()).trimEnd(), productsSection(tree), articleSummaries(byLoc)].filter(Boolean).join('\n\n---\n\n') + '\n';
}

// ── RSS ───────────────────────────────────────────────────────────────

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rfc822 = (iso: string) => new Date(iso.includes('T') || iso.endsWith('Z') ? iso : `${iso.replace(' ', 'T')}Z`).toUTCString();

/** RSS 2.0 feed of the published articles in one language. */
export async function rssXml(l: Loc): Promise<string> {
  const { blog } = await messages(l);
  const list = publishedArticles(l);
  const items = list.map((a) => {
    const link = articleUrl(a, l);
    return `<item><title>${xml(a[`title_${l}`])}</title><link>${link}</link><description>${xml(articleDesc(a, l))}</description><pubDate>${rfc822(publishedDate(a))}</pubDate><guid isPermaLink="true">${link}</guid></item>`;
  });
  const updated = list.map((a) => a.updated_at).sort().at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${xml(`${blog.metaTitle} | AirComfort`)}</title>
<link>${url(l, '/blog')}</link>
<description>${xml(blog.metaDescription)}</description>
<language>${l}</language>
<atom:link href="${url(l, '/blog/rss.xml')}" rel="self" type="application/rss+xml"/>
${updated ? `<lastBuildDate>${rfc822(updated)}</lastBuildDate>\n` : ''}${items.join('\n')}
</channel>
</rss>
`;
}
