'use client';

// Product form for /admin-v2: every field of the old form, in sections, with
// drag & drop photo upload/reordering and a live card preview. Payload,
// validation and API calls are the same as the old admin (lib/adminShared).
import { useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react';
import type { AdminProduct, ProductSpecs } from '@/lib/adminTypes';
import { type Category, categoryTree, descendantKeys, isFanCoil, isWithin, FAN_COILS_DUCTED_KEY, AIR_WATER_KEY } from '@/lib/categories';
import { validateFanCoilSpecs, PIPE_SYSTEMS, FAN_MOTORS } from '@/lib/fanCoil';
import {
  type ProductForm, ENERGY_CLASSES, MOUNTING_OPTIONS, ELECTRICAL_OPTIONS, FAN_SHARED_SPECS, buildProductPayload, firstImage,
} from '@/lib/adminShared';
import { useAdmin, api, revalidate, uploadImage } from '../context';
import { Badge, Button, Field, Modal, Spinner, Toggle } from '../ui';
import { IconGrip, IconUpload, IconX } from '../icons';

const MAX_PHOTOS = 10;

function Section({ title, children, tone }: { title: string; children: ReactNode; tone?: 'fan' }) {
  return (
    <section className={`rounded-2xl border p-5 ${tone === 'fan' ? 'border-accent/40 bg-brand-25 dark:bg-accent/[0.06]' : 'border-gray-200 dark:border-gray-800'}`}>
      <h4 className="mb-4 text-theme-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function ProductEditor({ initial, cats, products, onClose, onSaved }: {
  initial: ProductForm; cats: Category[]; products: AdminProduct[];
  onClose: () => void; onSaved: (p: AdminProduct, isNew: boolean) => void;
}) {
  const { t, lang } = useAdmin();
  const [f, setF] = useState<ProductForm>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [compatQ, setCompatQ] = useState('');
  const [onlyAw, setOnlyAw] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setF((p) => ({ ...p, [k]: v }));
  const specs = (f.specs ?? {}) as Record<string, string>;
  const setSpec = (k: keyof ProductSpecs, v: string) => setF((p) => ({ ...p, specs: { ...(p.specs ?? {}), [k]: v } }));
  const images = (f.image_urls as string[]) || [];
  const setImages = (next: string[]) => setF((p) => ({ ...p, image_urls: next, image_url: next[0] || '' }));

  const tree = useMemo(() => categoryTree(cats), [cats]);
  const catLabel = (key: string) => {
    const c = cats.find((x) => x.key === key);
    if (!c) return key;
    const nm = (x: Category) => (lang === 'lv' ? x.name_lv : lang === 'en' ? x.name_en : x.name_ru) || x.name_ru;
    const parent = c.parent_key ? cats.find((x) => x.key === c.parent_key) : null;
    return parent ? `${nm(parent)} → ${nm(c)}` : nm(c);
  };
  const fan = isFanCoil(cats, f.category);
  const ducted = isWithin(cats, f.category, FAN_COILS_DUCTED_KEY);

  // ── photos: same /api/admin/upload as the old admin, several files at once
  const addFiles = async (files: FileList | File[]) => {
    setUploadErr(null);
    const list = Array.from(files).slice(0, MAX_PHOTOS - images.length);
    for (const file of list) {
      setUploading((n) => n + 1);
      try {
        const url = await uploadImage(file);
        setF((p) => {
          const cur = (p.image_urls as string[]) || [];
          if (cur.length >= MAX_PHOTOS) return p;
          const next = [...cur, url];
          return { ...p, image_urls: next, image_url: next[0] };
        });
      } catch (e) {
        setUploadErr((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  const onDropZone = (e: DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };
  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setImages(next);
  };

  // ── compatible products (same rules as the old form)
  const compatIds = useMemo(() => f.compatible_ids ?? [], [f.compatible_ids]);
  const productTitle = (p: AdminProduct) => (lang === 'lv' ? p.name_lv : lang === 'en' ? p.name_en : p.name_ru) || p.name_en || p.name_ru;
  const candidates = useMemo(() => {
    const aw = descendantKeys(cats, AIR_WATER_KEY);
    const n = compatQ.trim().toLowerCase();
    return products
      .filter((p) => p.id !== f.id && !compatIds.includes(p.id))
      .filter((p) => !(fan && onlyAw) || aw.has(p.category))
      .filter((p) => !n || `${p.brand} ${p.name_ru} ${p.name_en} ${p.name_lv}`.toLowerCase().includes(n))
      .slice(0, 40);
  }, [products, cats, compatQ, onlyAw, fan, compatIds, f.id]);
  const toggleCompat = (id: string) => set('compatible_ids', compatIds.includes(id) ? compatIds.filter((x) => x !== id) : [...compatIds, id]);

  const save = async () => {
    const { id, ...fields } = f as AdminProduct;
    if (fan) {
      const { errors: e } = validateFanCoilSpecs(fields.specs as Record<string, unknown>, ducted);
      if (e.length) { setErrors(e); return; }
    }
    setErrors([]);
    setSaving(true);
    try {
      const payload = buildProductPayload(fields, fan);
      const saved = await api<AdminProduct>(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', json: payload });
      await revalidate();
      onSaved(saved, !id);
    } catch (e) {
      const err = e as Error & { errors?: string[] };
      setErrors(err.errors ?? [err.message]);
    } finally {
      setSaving(false);
    }
  };

  const features = (k: 'features_lv' | 'features_ru' | 'features_en') => {
    const v = f[k];
    return Array.isArray(v) ? v.join(', ') : (v ?? '');
  };
  const specFields: { key: keyof ProductSpecs; label: string }[] = [
    { key: 'manufacturer', label: t.specManufacturer }, { key: 'cooling_kw', label: t.specCooling }, { key: 'heating_kw', label: t.specHeating },
    { key: 'scop', label: t.specScop }, { key: 'seer', label: t.specSeer }, { key: 'noise_db', label: t.specNoise },
    { key: 'airflow', label: t.specAirflow }, { key: 'operating_temp', label: t.specTemp }, { key: 'mounting', label: t.specMounting },
    { key: 'refrigerant', label: t.specRefrigerant }, { key: 'wifi', label: t.specWifi }, { key: 'electrical', label: t.specElectrical },
    { key: 'indoor_dims', label: t.specIndoor }, { key: 'outdoor_dims', label: t.specOutdoor },
  ];
  const nameFor = (l: 'lv' | 'ru' | 'en') => f[`name_${l}`] || f.name_en || f.name_ru;
  const finalPrice = f.discount_percent ? Math.round(Number(f.price) * (1 - Number(f.discount_percent) / 100)) : Number(f.price);

  return (
    <Modal open onClose={onClose} size="xl" title={f.id ? t.prodEditTitle : t.prodAddTitle}
      footer={<>
        {errors.length > 0 && (
          <div className="mr-auto max-w-2xl rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">
            <b>{t.notSaved}:</b> {errors.join(' ')}
          </div>
        )}
        <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
        <Button onClick={save} disabled={saving || uploading > 0}>{saving ? t.saving : t.save}</Button>
      </>}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-3">
          <Section title={t.secBasic}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t.brandF}><input className="field-input" value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Daikin" /></Field>
              <Field label={t.categoryF}>
                <select className="field-input" value={f.category} onChange={(e) => set('category', e.target.value)}>
                  {tree.map(({ cat, children }) => children.length ? (
                    <optgroup key={cat.key} label={catLabel(cat.key)}>
                      <option value={cat.key}>{catLabel(cat.key)}</option>
                      {children.map((ch) => <option key={ch.key} value={ch.key}>{catLabel(ch.key)}</option>)}
                    </optgroup>
                  ) : <option key={cat.key} value={cat.key}>{catLabel(cat.key)}</option>)}
                </select>
              </Field>
            </div>
            <Field label={t.nameLv}><input className="field-input" value={f.name_lv} onChange={(e) => set('name_lv', e.target.value)} /></Field>
            <Field label={t.nameRu}><input className="field-input" value={f.name_ru} onChange={(e) => set('name_ru', e.target.value)} /></Field>
            <Field label={t.nameEn}><input className="field-input" value={f.name_en} onChange={(e) => set('name_en', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t.powerF}><input className="field-input" type="number" step="0.1" value={f.power_kw} onChange={(e) => set('power_kw', e.target.value as unknown as number)} /></Field>
              <Field label={t.areaF}><input className="field-input" value={f.area_coverage} onChange={(e) => set('area_coverage', e.target.value)} placeholder="20–25" /></Field>
              <Field label={t.energyF}>
                <select className="field-input" value={f.energy_class} onChange={(e) => set('energy_class', e.target.value)}>
                  <option value="">—</option>
                  {ENERGY_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={t.colorF}>
                <div className="flex gap-2">
                  <input type="color" value={f.brand_color} onChange={(e) => set('brand_color', e.target.value)} className="h-11 w-12 flex-shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-transparent dark:border-gray-700" aria-label={t.colorF} />
                  <input className="field-input font-mono" value={f.brand_color} onChange={(e) => set('brand_color', e.target.value)} />
                </div>
              </Field>
            </div>
          </Section>

          <Section title={t.secPrice}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label={t.priceF}><input className="field-input" type="number" value={f.price} onChange={(e) => set('price', e.target.value as unknown as number)} /></Field>
              <Field label={t.installF}><input className="field-input" type="number" value={f.install_price} onChange={(e) => set('install_price', e.target.value as unknown as number)} /></Field>
              <Field label={t.discountF} hint={t.discountHint}>
                <input className="field-input" type="number" min={1} max={99} value={f.discount_percent ?? ''} onChange={(e) => set('discount_percent', e.target.value === '' ? null : Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={f.in_stock} onChange={(v) => set('in_stock', v)} label={t.inStock} />
              <Toggle checked={!!f.is_hit} onChange={(v) => set('is_hit', v)} label={t.hit} color="orange" />
              <Toggle checked={!!f.is_promo} onChange={(v) => set('is_promo', v)} label={t.promo} color="pink" />
            </div>
          </Section>

          <Section title={t.secDesc}>
            {(['lv', 'ru', 'en'] as const).map((l) => (
              <Field key={l} label={l === 'lv' ? t.descLv : l === 'ru' ? t.descRu : t.descEn}>
                <textarea className="field-input resize-y" rows={3} value={f[`description_${l}`] ?? ''} onChange={(e) => set(`description_${l}`, e.target.value)} />
              </Field>
            ))}
          </Section>

          <Section title={t.secFeatures}>
            {(['lv', 'ru', 'en'] as const).map((l) => (
              <Field key={l} label={l === 'lv' ? t.featLv : l === 'ru' ? t.featRu : t.featEn}>
                <textarea className="field-input resize-y" rows={2} value={features(`features_${l}`)} onChange={(e) => set(`features_${l}`, e.target.value)} />
              </Field>
            ))}
          </Section>

          <Section title={t.secSpecs}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {specFields.filter(({ key }) => !fan || !FAN_SHARED_SPECS.includes(key)).map(({ key, label }) => (
                <Field key={key} label={label}>
                  {key === 'wifi' ? (
                    <Toggle checked={specs.wifi === 'yes'} onChange={(v) => setSpec('wifi', v ? 'yes' : '')} label={specs.wifi === 'yes' ? t.yes : t.no} />
                  ) : key === 'mounting' || key === 'electrical' ? (
                    <select className="field-input" value={specs[key] ?? ''} onChange={(e) => setSpec(key, e.target.value)}>
                      <option value="">{t.notSet}</option>
                      {(key === 'mounting' ? MOUNTING_OPTIONS : ELECTRICAL_OPTIONS).map((o) => <option key={o.value} value={o.value}>{o[lang]}</option>)}
                    </select>
                  ) : (
                    <input className="field-input" value={specs[key] ?? ''} onChange={(e) => setSpec(key, e.target.value)} />
                  )}
                </Field>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5 lg:col-span-2">
          <Section title={`${t.secPhotos} (${images.length}/${MAX_PHOTOS})`}>
            {images.length > 0 && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label={t.secPhotos}>
                {images.map((url, i) => (
                  <li key={url + i} draggable
                    onDragStart={() => setDragIdx(i)} onDragEnd={() => setDragIdx(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (dragIdx !== null) reorder(dragIdx, i); setDragIdx(null); }}
                    className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-gray-50 dark:bg-white/5 ${dragIdx === i ? 'opacity-40' : ''} ${i === 0 ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <img src={url} alt="" className="h-full w-full object-contain p-1" />
                    {i === 0 && <span className="absolute left-1 top-1"><Badge color="brand">{t.mainPhoto}</Badge></span>}
                    <span className="absolute bottom-1 left-1 rounded bg-white/80 p-0.5 text-gray-500 dark:bg-gray-900/80"><IconGrip className="h-3.5 w-3.5" /></span>
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label={t.removePhoto} title={t.removePhoto}
                      className="absolute right-1 top-1 rounded-full bg-gray-900/70 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100">
                      <IconX className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {images.length < MAX_PHOTOS && (
              <div role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDropZone}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${dragOver ? 'border-brand-500 bg-brand-25 dark:bg-accent/10' : 'border-gray-300 hover:border-brand-300 dark:border-gray-700'}`}>
                {uploading > 0 ? <Spinner /> : <IconUpload className="h-7 w-7 text-gray-400" />}
                <p className="mt-2 text-theme-sm text-gray-600 dark:text-gray-400">{uploading > 0 ? t.uploading : t.dropHere}</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
            <p className="field-hint">{t.photosHint}</p>
            {uploadErr && <p className="rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">{t.error}: {uploadErr}</p>}
          </Section>

          {fan && (
            <Section title={t.secFan} tone="fan">
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.fanPipes}>
                  <select className="field-input" value={specs.pipe_system ?? ''} onChange={(e) => setSpec('pipe_system', e.target.value)}>
                    <option value="">{t.select}</option>
                    {PIPE_SYSTEMS.map((v) => <option key={v} value={v}>{v === '2' ? t.fanPipes2 : t.fanPipes4}</option>)}
                  </select>
                </Field>
                <Field label={t.fanMotor}>
                  <select className="field-input" value={specs.fan_motor ?? ''} onChange={(e) => setSpec('fan_motor', e.target.value)}>
                    <option value="">{t.select}</option>
                    {FAN_MOTORS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label={t.fanCooling}><input className="field-input" inputMode="decimal" value={specs.cooling_kw ?? ''} onChange={(e) => setSpec('cooling_kw', e.target.value)} /></Field>
                <Field label={t.fanHeating}><input className="field-input" inputMode="decimal" value={specs.heating_kw ?? ''} onChange={(e) => setSpec('heating_kw', e.target.value)} /></Field>
                <Field label={t.fanAirflow}><input className="field-input" inputMode="decimal" value={specs.airflow ?? ''} onChange={(e) => setSpec('airflow', e.target.value)} /></Field>
                <Field label={t.fanNoise}><input className="field-input" inputMode="decimal" value={specs.noise_db ?? ''} onChange={(e) => setSpec('noise_db', e.target.value)} /></Field>
                {ducted && <Field label={t.fanEsp} className="col-span-2"><input className="field-input" inputMode="decimal" value={specs.esp_pa ?? ''} onChange={(e) => setSpec('esp_pa', e.target.value)} /></Field>}
              </div>
            </Section>
          )}

          <Section title={`${t.secCompat} (${compatIds.length})`}>
            <p className="field-hint !mt-0">{t.compatHint}</p>
            {compatIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {compatIds.map((cid) => {
                  const cp = products.find((x) => x.id === cid);
                  return (
                    <button key={cid} type="button" onClick={() => toggleCompat(cid)} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-theme-xs font-medium text-brand-700 hover:bg-error-50 hover:text-error-600 dark:bg-accent/15 dark:text-accent">
                      {cp ? productTitle(cp) : cid} <IconX className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            )}
            <input className="field-input" value={compatQ} onChange={(e) => setCompatQ(e.target.value)} placeholder={t.searchPh} aria-label={t.secCompat} />
            {fan && <label className="flex items-center gap-2 text-theme-sm text-gray-600 dark:text-gray-400"><input type="checkbox" checked={onlyAw} onChange={(e) => setOnlyAw(e.target.checked)} className="accent-brand-500" />{t.compatOnlyAw}</label>}
            <ul className="custom-scrollbar max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {candidates.map((cp) => (
                <li key={cp.id}>
                  <button type="button" onClick={() => toggleCompat(cp.id)} className="flex w-full justify-between gap-2 px-3 py-2 text-left text-theme-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                    <span className="truncate">{productTitle(cp)}</span><span className="flex-shrink-0 text-gray-400">{cp.price ? `${cp.price} €` : ''}</span>
                  </button>
                </li>
              ))}
              {candidates.length === 0 && <li className="px-3 py-2 text-theme-sm text-gray-400">{t.noData}</li>}
            </ul>
          </Section>

          {/* Live preview in the style of the public product card */}
          <Section title={t.secPreview}>
            <div className="mx-auto max-w-[280px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
              <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[#F8FAFC]">
                {firstImage(f.image_url) ? <img src={firstImage(f.image_url)} alt="" className="h-full w-full object-contain p-3 mix-blend-multiply" /> : <span className="text-sm font-semibold text-gray-400">{f.brand || '—'}</span>}
                {f.energy_class && <span className="absolute right-2 top-2 rounded-md border border-success-500/30 bg-success-50 px-1.5 text-theme-xs font-bold text-success-700">{f.energy_class}</span>}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                  {f.is_hit && <span className="rounded-full bg-[#C2410C] px-2 text-theme-xs font-bold text-white">{t.hit}</span>}
                  {f.is_promo && <span className="rounded-full bg-[#BE185D] px-2 text-theme-xs font-bold text-white">{t.promo}</span>}
                  {!!f.discount_percent && <span className="rounded-full bg-[#EAB308] px-2 text-theme-xs font-bold text-black">−{f.discount_percent}%</span>}
                </div>
              </div>
              <p className="mt-3 text-theme-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-accent">{f.brand}</p>
              <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">{nameFor(lang) || '—'}</p>
              <p className="mt-1 text-theme-xs text-gray-500">{f.power_kw} kW{f.area_coverage ? ` · ${f.area_coverage} m²` : ''}</p>
              <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
                <div>
                  {!!f.discount_percent && !!Number(f.price) && <span className="block text-theme-xs text-gray-400 line-through">{f.price} €</span>}
                  <span className="text-lg font-bold text-gray-800 dark:text-white">{Number(f.price) ? `${finalPrice} €` : '—'}</span>
                </div>
                <span className="text-theme-xs text-gray-500">{t.installFrom} {f.install_price} €</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </Modal>
  );
}
