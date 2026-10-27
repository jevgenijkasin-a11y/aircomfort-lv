'use client';

// Admin → Services: texts of the service pages (/pakalpojumi/<slug>) on three
// languages, the "from" price and the draft switch. The three pages are fixed
// (their addresses are linked from the menu, the footer and the home page).
import { useEffect, useState } from 'react';
import type { Service } from '@/lib/services';
import { useAdmin, api, revalidate } from '../context';
import { Badge, Button, Field, IconButton, Modal, PageHeader, Spinner, Toggle } from '../ui';
import { IconExternal, IconPencil } from '../icons';

const LOCS = ['lv', 'ru', 'en'] as const;

const TX = {
  ru: {
    desc: 'Страницы /pakalpojumi/… Черновик (DRAFT) открывается по ссылке, но не индексируется и не попадает в sitemap.',
    draft: 'Черновик (DRAFT)', published: 'Опубликовано', sort: 'Порядок', contact: 'Услуга в форме заявки',
    cats: 'Категории товаров для блока оборудования (ключи через запятую)', priceFrom: 'Цена «от», €', priceAuto: 'Цена «от» = «Монтаж от» из настроек сайта',
    priceNow: 'Сейчас на странице', none: 'не указана (TODO)', title: 'Заголовок H1', metaTitle: 'Title', metaDesc: 'Description',
    intro: 'Вводный текст (абзацы через пустую строку)', includes: '«Что входит в цену» — по пункту в строке',
    steps: '«Как проходит работа» — по шагу в строке', warranty: 'Гарантия (пусто — блок скрыт)', open: 'Открыть страницу',
  },
  lv: {
    desc: 'Lapas /pakalpojumi/… Melnraksts (DRAFT) atveras pēc saites, bet netiek indeksēts un nav sitemap.',
    draft: 'Melnraksts (DRAFT)', published: 'Publicēts', sort: 'Secība', contact: 'Pakalpojums pieteikuma formā',
    cats: 'Preču kategorijas (atslēgas ar komatu)', priceFrom: 'Cena «no», €', priceAuto: 'Cena «no» = «Montāža no» no vietnes iestatījumiem',
    priceNow: 'Pašlaik lapā', none: 'nav norādīta (TODO)', title: 'Virsraksts H1', metaTitle: 'Title', metaDesc: 'Description',
    intro: 'Ievadteksts (rindkopas ar tukšu rindu)', includes: '«Kas ietilpst cenā» — katrs punkts jaunā rindā',
    steps: '«Kā notiek darbs» — katrs solis jaunā rindā', warranty: 'Garantija (tukšs — bloks paslēpts)', open: 'Atvērt lapu',
  },
  en: {
    desc: 'Pages /pakalpojumi/… A draft (DRAFT) opens by link but is not indexed and not in the sitemap.',
    draft: 'Draft (DRAFT)', published: 'Published', sort: 'Order', contact: 'Service in the request form',
    cats: 'Product categories (keys, comma separated)', priceFrom: 'Price "from", €', priceAuto: 'Price "from" = "Installation from" in the site settings',
    priceNow: 'Shown now', none: 'not set (TODO)', title: 'H1 title', metaTitle: 'Title', metaDesc: 'Description',
    intro: 'Intro (paragraphs separated by an empty line)', includes: '"What the price includes" — one item per line',
    steps: '"How it works" — one step per line', warranty: 'Warranty (empty — block hidden)', open: 'Open the page',
  },
};

export default function Services() {
  const { t, lang, toast } = useAdmin();
  const x = TX[lang as keyof typeof TX] ?? TX.ru;
  const [list, setList] = useState<Service[] | null>(null);
  const [prices, setPrices] = useState<Record<number, number | null>>({});
  const [form, setForm] = useState<Service | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => api<{ services: Service[]; prices: Record<number, number | null> }>('/api/admin/services')
    .then((d) => { setList(d.services); setPrices(d.prices); });
  useEffect(() => { load(); }, []);

  const set = (k: keyof Service, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const title = (s: Service) => (lang === 'lv' ? s.title_lv : lang === 'en' ? s.title_en : s.title_ru) || s.slug;

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setErrors([]);
    const { id, slug: _slug, created_at: _c, updated_at: _u, ...body } = form;
    try {
      await api(`/api/admin/services/${id}`, { method: 'PUT', json: body });
      await revalidate();
      setForm(null);
      toast(t.saved);
      load();
    } catch (err) {
      const e = err as Error & { errors?: string[] };
      setErrors(e.errors ?? [e.message]);
    } finally { setSaving(false); }
  };

  /** One text field on three languages side by side (k = field name without the _lv/_ru/_en suffix). */
  const area = (k: 'meta_description' | 'intro' | 'includes' | 'steps' | 'warranty', rows: number, label: string) => (
    <Field label={label}>
      <div className="grid gap-2 md:grid-cols-3">
        {LOCS.map((l) => (
          <textarea key={l} className="field-input" rows={rows} aria-label={`${label} ${l}`} placeholder={l.toUpperCase()}
            value={String(form?.[`${k}_${l}`] ?? '')} onChange={(e) => set(`${k}_${l}`, e.target.value)} />
        ))}
      </div>
    </Field>
  );

  return (
    <div>
      <PageHeader title={t.navServices} desc={x.desc} />
      {!list ? <Spinner /> : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <table className="w-full text-left text-theme-sm">
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800 dark:text-white/90">{title(s)}</p>
                    <p className="font-mono text-theme-xs text-gray-500">/pakalpojumi/{s.slug}</p>
                  </td>
                  <td className="px-5 py-4">{s.is_draft ? <Badge color="warning">DRAFT</Badge> : <Badge color="success">{x.published}</Badge>}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{prices[s.id] ? `${x.priceNow}: ${prices[s.id]} €` : `${x.priceNow}: ${x.none}`}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <a href={`/${lang === 'en' ? 'en' : lang === 'ru' ? 'ru' : 'lv'}/pakalpojumi/${s.slug}`} target="_blank" rel="noopener" aria-label={x.open} title={x.open}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"><IconExternal className="h-4 w-4" /></a>
                    <IconButton label={t.edit} onClick={() => { setErrors([]); setForm({ ...s }); }}><IconPencil className="h-4 w-4" /></IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} size="xl" title={form ? title(form) : ''}
        footer={<>
          <Button variant="outline" onClick={() => setForm(null)}>{t.cancel}</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Spinner className="h-4 w-4" /> : t.save}</Button>
        </>}>
        {form && (
          <div className="space-y-5">
            {errors.length > 0 && <div className="rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/10">{errors.join(' ')}</div>}
            <div className="grid gap-4 md:grid-cols-4">
              <Toggle checked={form.is_draft} onChange={(v) => set('is_draft', v)} label={x.draft} color="orange" />
              <Field label={x.sort}><input className="field-input" type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} /></Field>
              <Field label={x.contact}>
                <select className="field-input" value={form.contact_service} onChange={(e) => set('contact_service', e.target.value)}>
                  <option value="install">install</option><option value="maintenance">maintenance</option>
                  <option value="consultation">consultation</option><option value="other">other</option>
                </select>
              </Field>
              <Field label={x.cats}><input className="field-input font-mono" value={form.product_categories} onChange={(e) => set('product_categories', e.target.value)} placeholder="home,heat_pump" /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-[200px_1fr] items-end">
              <Field label={x.priceFrom}><input className="field-input" type="number" min={0} value={form.price_from ?? ''} onChange={(e) => set('price_from', e.target.value === '' ? null : Number(e.target.value))} /></Field>
              <Toggle checked={form.price_auto} onChange={(v) => set('price_auto', v)} label={x.priceAuto} />
            </div>
            <Field label={x.title}>
              <div className="grid gap-2 md:grid-cols-3">
                {LOCS.map((l) => <input key={l} className="field-input" aria-label={`${x.title} ${l}`} placeholder={l.toUpperCase()} value={form[`title_${l}`]} onChange={(e) => set(`title_${l}`, e.target.value)} />)}
              </div>
            </Field>
            <Field label={x.metaTitle}>
              <div className="grid gap-2 md:grid-cols-3">
                {LOCS.map((l) => <input key={l} className="field-input" aria-label={`${x.metaTitle} ${l}`} placeholder={l.toUpperCase()} value={form[`meta_title_${l}`]} onChange={(e) => set(`meta_title_${l}`, e.target.value)} />)}
              </div>
            </Field>
            {area('meta_description', 3, x.metaDesc)}
            {area('intro', 6, x.intro)}
            {area('includes', 6, x.includes)}
            {area('steps', 6, x.steps)}
            {area('warranty', 3, x.warranty)}
          </div>
        )}
      </Modal>
    </div>
  );
}
