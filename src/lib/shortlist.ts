'use client';

// Favourites and comparison lists kept in localStorage (no account needed).
// Every storage access is wrapped in try/catch: in private mode or with
// blocked site data the lists simply live in memory for the current page.
// Tabs stay in sync through the `storage` event.
import { useSyncExternalStore } from 'react';

export type CompareItem = { id: string; category: string; name: string; image: string | null };

const FAV_KEY = 'acFavorites';
const CMP_KEY = 'acCompare';

/** Products of one "kind" can be compared: fan coil subtypes count as one. */
export const compareGroup = (category: string) => (category.startsWith('fan_coils') ? 'fan_coils' : category);

/** 3 products on phones, 4 on larger screens. */
export const compareLimit = () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 4);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function createStore<T>(key: string, fallback: T, valid: (v: unknown) => v is T) {
  let value: T | null = null; // loaded lazily on the client
  const subs = new Set<() => void>();
  const get = (): T => {
    if (value === null) {
      const v = read<unknown>(key, fallback);
      value = valid(v) ? v : fallback;
    }
    return value;
  };
  const set = (next: T) => {
    value = next;
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage blocked */ }
    subs.forEach((f) => f());
  };
  const subscribe = (f: () => void) => {
    subs.add(f);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      value = null;
      subs.forEach((g) => g());
    };
    window.addEventListener('storage', onStorage);
    return () => { subs.delete(f); window.removeEventListener('storage', onStorage); };
  };
  const useValue = () => useSyncExternalStore(subscribe, get, () => fallback);
  return { get, set, useValue };
}

const isIdList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isCompareList = (v: unknown): v is CompareItem[] =>
  Array.isArray(v) && v.every((x) => x && typeof x === 'object' && typeof (x as CompareItem).id === 'string' && typeof (x as CompareItem).category === 'string');

const EMPTY_IDS: string[] = [];
const EMPTY_CMP: CompareItem[] = [];
const favStore = createStore<string[]>(FAV_KEY, EMPTY_IDS, isIdList);
const cmpStore = createStore<CompareItem[]>(CMP_KEY, EMPTY_CMP, isCompareList);

// ── favourites ───────────────────────────────────────────────────────
export const useFavorites = favStore.useValue;
export function toggleFavorite(id: string) {
  const list = favStore.get();
  favStore.set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
}
export const removeFavorite = (id: string) => favStore.set(favStore.get().filter((x) => x !== id));
/** Drops ids the server no longer returns (deleted / not public any more). */
export const keepFavorites = (ids: string[]) => {
  const keep = new Set(ids);
  const list = favStore.get();
  if (list.some((x) => !keep.has(x))) favStore.set(list.filter((x) => keep.has(x)));
};

// ── comparison ───────────────────────────────────────────────────────
export const useCompare = cmpStore.useValue;

/** Pending problem shown by the compare bar: other category or list full. */
export type CompareNotice = { kind: 'category'; item: CompareItem } | { kind: 'limit'; limit: number } | null;
const noticeStore = (() => {
  let value: CompareNotice = null;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set: (v: CompareNotice) => { value = v; subs.forEach((f) => f()); },
    subscribe: (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; },
  };
})();
export const useCompareNotice = () => useSyncExternalStore(noticeStore.subscribe, noticeStore.get, () => null);
export const closeCompareNotice = () => noticeStore.set(null);

export function toggleCompare(item: CompareItem) {
  const list = cmpStore.get();
  if (list.some((x) => x.id === item.id)) {
    cmpStore.set(list.filter((x) => x.id !== item.id));
    return;
  }
  if (list.length && compareGroup(list[0].category) !== compareGroup(item.category)) {
    noticeStore.set({ kind: 'category', item });
    return;
  }
  const limit = compareLimit();
  if (list.length >= limit) {
    noticeStore.set({ kind: 'limit', limit });
    return;
  }
  cmpStore.set([...list, item]);
}
export const removeCompare = (id: string) => cmpStore.set(cmpStore.get().filter((x) => x.id !== id));
export const clearCompare = () => cmpStore.set(EMPTY_CMP);
/** "Replace the list" after the other-category notice. */
export function replaceCompare(item: CompareItem) {
  cmpStore.set([item]);
  noticeStore.set(null);
}
