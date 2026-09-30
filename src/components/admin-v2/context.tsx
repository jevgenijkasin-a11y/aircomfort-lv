'use client';

import { createContext, useContext } from 'react';
import type { Dict, Lang } from './i18n';

export type Section =
  | 'dashboard' | 'requests' | 'products' | 'categories' | 'slider'
  | 'cards' | 'reviews' | 'texts' | 'settings' | 'password';

export type AdminCtx = {
  t: Dict;
  lang: Lang;
  /** Switch section; optional search query / item id to open */
  go: (s: Section, opts?: { q?: string; edit?: string }) => void;
  /** Header search text (products / requests read it) */
  query: string;
  setQuery: (q: string) => void;
  /** Product id to open in the editor right away (from the dashboard) */
  editId: string | null;
  clearEdit: () => void;
  toast: (text: string, kind?: 'ok' | 'err') => void;
};

export const Ctx = createContext<AdminCtx | null>(null);
export const useAdmin = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin outside AdminV2App');
  return c;
};

/** fetch → JSON, throws Error(message from API) on HTTP errors. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    ...(json !== undefined ? { body: JSON.stringify(json), headers: { 'Content-Type': 'application/json', ...(rest.headers ?? {}) } } : {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error((data && (data.errors?.join(' ') || data.error)) || `HTTP ${res.status}`) as Error & { errors?: string[] };
    e.errors = data?.errors;
    throw e;
  }
  return data as T;
}

/** Same revalidation call the old admin makes after changes. */
export const revalidate = () => fetch('/api/admin/revalidate', { method: 'POST' });

/** Upload through the existing /api/admin/upload (type check + WebP). */
export async function uploadImage(file: File, endpoint = '/api/admin/upload'): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await api<{ url: string }>(endpoint, { method: 'POST', body: fd });
  return r.url;
}

export const fmtDate = (iso: string, lang: Lang, withTime = true) => {
  const d = new Date(iso);
  const loc = lang === 'lv' ? 'lv-LV' : lang === 'en' ? 'en-GB' : 'ru-RU';
  return withTime
    ? `${d.toLocaleDateString(loc)} ${d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })}`
    : d.toLocaleDateString(loc);
};
