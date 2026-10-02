'use client';

// Languages the current page exists in, for the header language switcher.
// Pages available in every language (the default) don't set anything; a blog
// article sets its languages so the switcher sends other languages to the
// article list instead of a 404.
import { useEffect, useSyncExternalStore } from 'react';

let current: string[] | null = null;
const subs = new Set<() => void>();

function set(next: string[] | null) {
  current = next;
  subs.forEach((f) => f());
}

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => { subs.delete(f); };
};

export const usePageLocales = () => useSyncExternalStore(subscribe, () => current, () => null);

/** Rendered by a page that exists only in some languages. */
export function PageLocales({ locales }: { locales: string[] }) {
  const key = locales.join(',');
  useEffect(() => {
    set(key.split(','));
    return () => set(null);
  }, [key]);
  return null;
}
