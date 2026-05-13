'use client';

import { useState, useEffect, useRef } from 'react';
import { T, Lang, AdminProduct } from './adminStrings';
import { supabase } from '@/lib/supabase';

type ProductForm = Omit<AdminProduct, 'id' | 'created_at'> & { id?: number };

const EMPTY: ProductForm = {
  brand: '', name_lv: '', name_ru: '', name_en: '',
  category: 'home', power_kw: 2.5, area_coverage: '20–25',
  price: 0, install_price: 249, energy_class: 'A++',
  features: [], features_lv: [], features_ru: [], features_en: [],
  brand_color: '#1A6B9A', image_url: '', image_urls: [], in_stock: true,
};

const energyClasses = ['A+++', 'A++', 'A+', 'A', 'B'];

export default function AdminProducts({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; product: ProductForm }>({ open: false, product: EMPTY });
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts((data ?? []) as AdminProduct[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ open: true, product: { ...EMPTY } });
  const openEdit = (p: AdminProduct) => {
    const hasLocale = p.features.some(f => /^(lv|ru|en):/.test(f));
    let imgs: string[] = [];
    if (p.image_url?.startsWith('[')) {
      try { imgs = JSON.parse(p.image_url); } catch { imgs = p.image_url ? [p.image_url] : []; }
    } else if (p.image_url) {
      imgs = [p.image_url];
    }
    setModal({
      open: true, product: {
        ...p,
        image_urls: imgs,
        features_lv: hasLocale ? p.features.filter(f => f.startsWith('lv:')).map(f => f.slice(3)) : [],
        features_ru: hasLocale ? p.features.filter(f => f.startsWith('ru:')).map(f => f.slice(3)) : [],
        features_en: hasLocale ? p.features.filter(f => f.startsWith('en:')).map(f => f.slice(3)) : p.features,
      },
    });
  };
  const closeModal = () => setModal({ open: false, product: EMPTY });

  const setField = (k: string, v: unknown) =>
    setModal((m) => ({ ...m, product: { ...m.product, [k]: v } }));

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (r.ok) {
      const { url } = await r.json();
      setModal(m => {
        const current = m.product.image_urls || [];
        if (current.length >= 10) return m;
        const next = [...current, url];
        return { ...m, product: { ...m.product, image_urls: next, image_url: next[0] } };
      });
    }
    setUploadingImg(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setModal(m => {
      const next = (m.product.image_urls || []).filter((_, i) => i !== index);
      return { ...m, product: { ...m.product, image_urls: next, image_url: next[0] || '' } };
    });
  };

  const save = async () => {
    setSaving(true);
    const { id, ...fields } = modal.product as AdminProduct;

    const parseStr = (v: unknown) =>
      typeof v === 'string' ? v.split(',').map(f => f.trim()).filter(Boolean)
      : Array.isArray(v) ? v : [];

    const tagged = (arr: string[], lang: string) => arr.map(f => `${lang}:${f}`);

    const lv = parseStr(fields.features_lv);
    const ru = parseStr(fields.features_ru);
    const en = parseStr(fields.features_en);
    const hasLocale = lv.length || ru.length || en.length;
    const features = hasLocale
      ? [...tagged(lv, 'lv'), ...tagged(ru, 'ru'), ...tagged(en, 'en')]
      : parseStr(fields.features);

    const { features_lv: _flv, features_ru: _fru, features_en: _fen, features: _f, image_urls: _iu, ...restFields } = fields;
    const imageUrls: string[] = (fields.image_urls as string[]) || [];
    const imageUrlValue = imageUrls.length > 1
      ? JSON.stringify(imageUrls)
      : (imageUrls[0] || '');
    const payload = {
      ...restFields,
      features,
      image_url: imageUrlValue,
      power_kw: Number(fields.power_kw),
      price: Number(fields.price),
      install_price: Number(fields.install_price),
    };

    if (id) {
      const { data } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (data) setProducts((prev) => prev.map((p) => (p.id === id ? (data as AdminProduct) : p)));
    } else {
      const { data } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      if (data) setProducts((prev) => [data as AdminProduct, ...prev]);
    }
    await fetch('/api/admin/revalidate', { method: 'POST' });
    setSaving(false);
    closeModal();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
    await fetch('/api/admin/revalidate', { method: 'POST' });
  };

  const inp = 'w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#27C4A0]/50 transition-colors placeholder-white/20';
  const lbl = 'block text-xs text-white/50 mb-1.5 font-medium';

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{s.prodTitle}</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#27C4A0] hover:bg-[#1fa389] text-[#0B1929] font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {s.prodAdd}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/40">{s.loading}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden group hover:border-white/15 transition-all">
              <div className="h-28 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${p.brand_color}15, ${p.brand_color}05)` }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name_en} className="h-full w-full object-contain p-4" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
                <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-lg bg-[#27C4A0]/20 text-[#27C4A0] border border-[#27C4A0]/30">{p.energy_class}</span>
                {!p.in_stock && (
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                    {lang === 'ru' ? 'Нет' : 'OOS'}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-[#27C4A0] text-xs font-semibold uppercase tracking-wider mb-0.5">{p.brand}</p>
                <p className="text-white font-semibold text-sm leading-snug mb-2">{p.name_en}</p>
                <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                  <span>{p.power_kw} kW · {p.area_coverage} m²</span>
                  <span className="font-bold text-white text-base">{p.price.toLocaleString()} €</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 bg-white/8 hover:bg-white/12 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {s.prodEdit}
                  </button>
                  <button onClick={() => setConfirmId(p.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-end z-50">
          <div className="w-full max-w-md h-full bg-[#0D2137] border-l border-white/10 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#0D2137] z-10">
              <h2 className="font-bold text-white">{modal.product.id ? s.prodEditTitle : s.prodAddTitle}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1">
              <div>
                <label className={lbl}>{s.prodBrand}</label>
                <input className={inp} value={modal.product.brand} onChange={(e) => setField('brand', e.target.value)} placeholder="Daikin" />
              </div>

              <div>
                <label className={lbl}>{s.prodNameLv}</label>
                <input className={inp} value={modal.product.name_lv} onChange={(e) => setField('name_lv', e.target.value)} placeholder="Daikin Perfera 2.5kW" />
              </div>

              <div>
                <label className={lbl}>{s.prodNameRu}</label>
                <input className={inp} value={modal.product.name_ru} onChange={(e) => setField('name_ru', e.target.value)} placeholder="Дайкин Перфера 2.5кВт" />
              </div>

              <div>
                <label className={lbl}>{s.prodNameEn}</label>
                <input className={inp} value={modal.product.name_en} onChange={(e) => setField('name_en', e.target.value)} placeholder="Daikin Perfera 2.5kW" />
              </div>

              <div>
                <label className={lbl}>{s.prodCategory}</label>
                <select className={inp} value={modal.product.category} onChange={(e) => setField('category', e.target.value)} style={{ background: '#0D2137' }}>
                  <option value="home">{s.prodCatHome}</option>
                  <option value="heat_pump">{s.prodCatHeatPump}</option>
                  <option value="commercial">{s.prodCatCommercial}</option>
                  <option value="commercial_heat_pump">{s.prodCatCommercialHeatPump}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{s.prodPower}</label>
                  <input className={inp} type="number" step="0.5" value={modal.product.power_kw} onChange={(e) => setField('power_kw', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>{s.prodArea}</label>
                  <input className={inp} value={modal.product.area_coverage} onChange={(e) => setField('area_coverage', e.target.value)} placeholder="20–25" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{s.prodPrice}</label>
                  <input className={inp} type="number" value={modal.product.price} onChange={(e) => setField('price', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>{s.prodInstallPrice}</label>
                  <input className={inp} type="number" value={modal.product.install_price} onChange={(e) => setField('install_price', e.target.value)} />
                </div>
              </div>

              <div>
                <label className={lbl}>{s.prodEnergyClass}</label>
                <select className={inp} value={modal.product.energy_class} onChange={(e) => setField('energy_class', e.target.value)} style={{ background: '#0D2137' }}>
                  {energyClasses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="bg-white/3 border border-white/8 rounded-xl p-3 space-y-2">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">{s.prodFeatures}</p>
                <div>
                  <label className={lbl}>{s.prodFeaturesLv}</label>
                  <textarea className={`${inp} resize-none`} rows={2} value={Array.isArray(modal.product.features_lv) ? modal.product.features_lv.join(', ') : (modal.product.features_lv ?? '')} onChange={(e) => setField('features_lv', e.target.value)} placeholder="Inverters, Wi-Fi, A+++, R32" />
                </div>
                <div>
                  <label className={lbl}>{s.prodFeaturesRu}</label>
                  <textarea className={`${inp} resize-none`} rows={2} value={Array.isArray(modal.product.features_ru) ? modal.product.features_ru.join(', ') : (modal.product.features_ru ?? '')} onChange={(e) => setField('features_ru', e.target.value)} placeholder="Инвертор, Wi-Fi, A+++, R32" />
                </div>
                <div>
                  <label className={lbl}>{s.prodFeaturesEn}</label>
                  <textarea className={`${inp} resize-none`} rows={2} value={Array.isArray(modal.product.features_en) ? modal.product.features_en.join(', ') : (modal.product.features_en ?? '')} onChange={(e) => setField('features_en', e.target.value)} placeholder="Inverter, Wi-Fi, A+++, R32" />
                </div>
              </div>

              <div>
                <label className={lbl}>{s.prodBrandColor}</label>
                <div className="flex gap-2">
                  <input type="color" value={modal.product.brand_color} onChange={(e) => setField('brand_color', e.target.value)} className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border border-white/10" />
                  <input className={`${inp} flex-1`} value={modal.product.brand_color} onChange={(e) => setField('brand_color', e.target.value)} placeholder="#003087" />
                </div>
              </div>

              <div>
                <label className={lbl}>
                  {lang === 'ru' ? `Фото товара (${(modal.product.image_urls || []).length}/10)` : `Product Photos (${(modal.product.image_urls || []).length}/10)`}
                </label>

                {(modal.product.image_urls || []).length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {(modal.product.image_urls || []).map((url, i) => (
                      <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-[#27C4A0] text-[#0B1929] text-[9px] font-bold px-1 py-0.5 rounded z-10 leading-none">
                            {lang === 'ru' ? 'Гл.' : 'Main'}
                          </span>
                        )}
                        <img src={url} alt="" className="w-full h-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors z-10 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(modal.product.image_urls || []).length < 10 && (
                  <div
                    onClick={() => !uploadingImg && fileRef.current?.click()}
                    className="border-2 border-dashed border-white/15 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#27C4A0]/40 transition-colors min-h-[72px]"
                  >
                    {uploadingImg ? (
                      <div className="w-5 h-5 border-2 border-[#27C4A0]/30 border-t-[#27C4A0] rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-white/20 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <p className="text-white/30 text-xs">{lang === 'ru' ? 'Добавить фото' : 'Add photo'}</p>
                      </>
                    )}
                  </div>
                )}

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modal.product.in_stock}
                    onChange={(e) => setField('in_stock', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27C4A0]"></div>
                </label>
                <span className="text-sm text-white/60">{s.prodInStock}</span>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex gap-3 sticky bottom-0 bg-[#0D2137]">
              <button onClick={save} disabled={saving} className="flex-1 bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 text-[#0B1929] font-semibold py-3 rounded-xl transition-colors">
                {saving ? s.saving : s.prodSave}
              </button>
              <button onClick={closeModal} className="px-5 bg-white/8 hover:bg-white/12 text-white font-semibold py-3 rounded-xl transition-colors">{s.prodCancel}</button>
            </div>
          </div>
        </div>
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D2137] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <p className="text-white font-semibold text-lg mb-5">{s.prodDeleteConfirm}</p>
            <div className="flex gap-3">
              <button onClick={() => deleteProduct(confirmId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors">{s.confirm}</button>
              <button onClick={() => setConfirmId(null)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 rounded-xl transition-colors">{s.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
