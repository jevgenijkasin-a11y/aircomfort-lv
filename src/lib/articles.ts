// Blog articles: types, validation and markdown rendering shared by the public
// pages, the admin editor (live preview) and the import script. No server-only
// imports here.
import { Marked, Renderer, type Token, type Tokens } from 'marked';

export type Loc = 'lv' | 'ru' | 'en';
export const ARTICLE_LOCALES: Loc[] = ['lv', 'ru', 'en'];

export const ARTICLE_CATEGORIES = ['cooling', 'heating', 'subsidy'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface Article {
  id: number;
  slug: string;
  category: ArticleCategory;
  title_lv: string; title_ru: string; title_en: string;
  meta_title_lv: string; meta_title_ru: string; meta_title_en: string;
  meta_description_lv: string; meta_description_ru: string; meta_description_en: string;
  body_lv: string; body_ru: string; body_en: string;
  cover_url: string;
  /** Idea for the cover picture (from the import), shown as a hint in the admin. */
  cover_idea: string;
  /** Catalog path without the locale, e.g. /catalog/type/air-to-water-heat-pumps */
  related_catalog: string;
  related_product_ids: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ArticleInput = Omit<Article, 'id' | 'published_at' | 'created_at' | 'updated_at'>;

/** Columns the admin / import may write (everything except ids and dates). */
export const ARTICLE_FIELDS = [
  'slug', 'category',
  'title_lv', 'title_ru', 'title_en',
  'meta_title_lv', 'meta_title_ru', 'meta_title_en',
  'meta_description_lv', 'meta_description_ru', 'meta_description_en',
  'body_lv', 'body_ru', 'body_en',
  'cover_url', 'cover_idea', 'related_catalog', 'related_product_ids', 'is_published',
] as const;

export const ARTICLE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A language version exists when it has both a title and a text. */
export const hasLocale = (a: Pick<Article, `title_${Loc}` | `body_${Loc}`>, l: Loc) =>
  !!(a[`title_${l}`]?.trim() && a[`body_${l}`]?.trim());

export const articleLocales = (a: Pick<Article, `title_${Loc}` | `body_${Loc}`>) => ARTICLE_LOCALES.filter((l) => hasLocale(a, l));

/** "/lv/catalog/type/x" or "catalog/type/x/" → "/catalog/type/x"; '' when empty or not a catalog path. */
export function normalizeCatalogPath(p: string | null | undefined): string {
  let s = String(p ?? '').trim();
  if (!s) return '';
  try { if (/^https?:\/\//i.test(s)) s = new URL(s).pathname; } catch { /* keep as is */ }
  s = ('/' + s.replace(/^\/+/, '')).replace(/\/+$/, '');
  s = s.replace(/^\/(lv|ru|en)(?=\/|$)/, '');
  return /^\/catalog(\/[a-z0-9-]+)*$/.test(s) ? s : '';
}

/**
 * Cleans an article payload from the admin / import.
 * Returns the fields to save and Russian error messages (admin language).
 */
export function validateArticle(body: Record<string, unknown>, creating: boolean): { data: Partial<ArticleInput>; errors: string[] } {
  const errors: string[] = [];
  const data: Record<string, unknown> = {};
  for (const k of ARTICLE_FIELDS) {
    if (!(k in body)) continue;
    const v = body[k];
    if (k === 'is_published') data[k] = v === true || v === 1 || v === 'true';
    else if (k === 'related_product_ids') data[k] = Array.isArray(v) ? Array.from(new Set(v.map(String).filter(Boolean))) : [];
    else if (k === 'related_catalog') data[k] = normalizeCatalogPath(v as string);
    else data[k] = String(v ?? '').replace(/\r\n?/g, '\n').trim();
  }
  if (creating || 'slug' in data) {
    const slug = String(data.slug ?? '');
    if (!slug) errors.push('Укажите URL-ключ статьи (латиницей, например siltumsuknis-gaiss-udens).');
    else if (!ARTICLE_SLUG_RE.test(slug)) errors.push('URL-ключ: только латинские буквы в нижнем регистре, цифры и дефисы.');
  }
  if (creating || 'category' in data) {
    if (!(ARTICLE_CATEGORIES as readonly string[]).includes(String(data.category ?? ''))) errors.push('Выберите раздел: охлаждение, отопление или субсидии.');
  }
  if ('related_catalog' in body && body.related_catalog && !data.related_catalog) {
    errors.push('Раздел каталога: укажите путь вида /catalog/type/air-to-water-heat-pumps.');
  }
  for (const l of ARTICLE_LOCALES) {
    const title = data[`title_${l}`] as string | undefined;
    const text = data[`body_${l}`] as string | undefined;
    if (title !== undefined && text !== undefined && !!title !== !!text) {
      errors.push(`${l.toUpperCase()}: заполните и заголовок, и текст (или оставьте оба пустыми).`);
    }
  }
  return { data: data as Partial<ArticleInput>, errors };
}

/** Error text for the UNIQUE constraint on slug. */
export const articleDbError = (e: unknown) =>
  /UNIQUE.*slug/i.test((e as Error)?.message ?? '')
    ? 'Статья с таким URL-ключом уже есть — выберите другой.'
    : (e as Error)?.message ?? 'Ошибка сохранения';

// ── markdown ──────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Removes a leading "# Title" line: the page H1 comes from the title field. */
export function stripLeadingH1(md: string): string {
  return md.replace(/^﻿?\s*#\s+[^\n]*\n+/, '');
}

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // Raw HTML in the text is shown as text, never injected into the page
    html({ text }) { return esc(text); },
    // The page has its own H1 → headings start at H2
    heading({ tokens, depth }) {
      const d = Math.min(Math.max(depth, 2), 4);
      return `<h${d}>${this.parser.parseInline(tokens)}</h${d}>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : '#';
      const external = /^https?:\/\//i.test(safe) && !/^https?:\/\/(www\.)?aircomfort\.lv/i.test(safe);
      return `<a href="${esc(safe)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
    },
    image({ href, title, text }) {
      const safe = /^(https?:|\/)/i.test(href) ? href : '';
      return safe ? `<img src="${esc(safe)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} loading="lazy">` : '';
    },
    // Wide tables scroll inside their own box on phones
    table(token) {
      return `<div class="table-wrap">${Renderer.prototype.table.call(this, token)}</div>\n`;
    },
  },
});

export function renderMarkdown(md: string): string {
  return marked.parse(stripLeadingH1(md ?? ''), { async: false }) as string;
}

// ── FAQ (for FAQPage JSON-LD) ─────────────────────────────────────────

const FAQ_HEADING = /^(faq|biežāk uzdotie jautājumi|bieži uzdotie jautājumi|частые вопросы|часто задаваемые вопросы|frequently asked questions)(?=[\s:.!?]|$)/i;
const NOT_A_QUESTION = /^(avoti|источники|sources)(?=[\s:.!?]|$)/i;

/** Markdown inline → plain text (for JSON-LD). */
function plain(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export type FaqItem = { q: string; a: string };

/**
 * Questions and answers of the article's FAQ section: an H2 "FAQ" /
 * "Biežāk uzdotie jautājumi" / "Частые вопросы", questions as H3 or as a bold
 * line ("**Question?**") at the start of a paragraph. The section ends at the
 * next H2 (or an H3 "Sources").
 */
export function extractFaq(md: string): FaqItem[] {
  const tokens = marked.lexer(stripLeadingH1(md ?? ''));
  const out: FaqItem[] = [];
  let inFaq = false;
  let cur: { q: string; a: string[] } | null = null;
  const flush = () => {
    if (cur && cur.q && cur.a.join(' ').trim()) out.push({ q: cur.q, a: cur.a.join(' ').trim() });
    cur = null;
  };
  for (const tok of tokens as Token[]) {
    if (tok.type === 'heading') {
      const h = tok as Tokens.Heading;
      const text = plain(h.text);
      if (h.depth <= 2) {
        flush();
        inFaq = FAQ_HEADING.test(text);
        continue;
      }
      if (!inFaq) continue;
      flush();
      if (NOT_A_QUESTION.test(text)) { inFaq = false; continue; }
      cur = { q: text, a: [] };
      continue;
    }
    if (!inFaq) continue;
    if (tok.type === 'paragraph') {
      const raw = (tok as Tokens.Paragraph).text;
      const m = raw.match(/^\s*(\*\*|__)([^\n]+?)\1\s*(?:\n|$)([\s\S]*)$/);
      if (m && /\?\s*$/.test(plain(m[2]))) {
        flush();
        cur = { q: plain(m[2]), a: m[3].trim() ? [plain(m[3])] : [] };
      } else if (cur) {
        cur.a.push(plain(raw));
      }
    } else if (tok.type === 'list' && cur) {
      cur.a.push((tok as Tokens.List).items.map((i) => plain(i.text)).join('; '));
    }
  }
  flush();
  return out;
}

/** First paragraph-ish text for cards when meta_description is empty. */
export function excerpt(md: string, max = 200): string {
  const text = plain(stripLeadingH1(md ?? '').split(/\n\s*\n/).find((p) => p.trim() && !/^\s*(#|\||[-*] |\d+\. )/.test(p)) ?? '');
  return text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : text;
}
