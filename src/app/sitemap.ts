import type { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase';

const BASE_URL = 'https://aircomfort.lv';
const locales = ['lv', 'ru', 'en'] as const;

const staticPaths = ['', '/catalog', '/calculator', '/contacts', '/privacy'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: products } = await supabaseServer
    .from('products')
    .select('id, created_at')
    .eq('in_stock', true);

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
    }))
  );

  const productEntries: MetadataRoute.Sitemap = (products ?? []).flatMap((p) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/catalog/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...productEntries];
}
