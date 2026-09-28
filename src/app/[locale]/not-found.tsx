import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Rendered inside the locale layout (header/footer) for notFound() calls,
// e.g. unknown product ids or catalogue pages out of range.
export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="pt-40 pb-24 max-w-2xl mx-auto px-4 text-center">
      <p className="font-heading font-bold text-6xl text-primary mb-4">404</p>
      <h1 className="font-heading font-bold text-3xl mb-3">{t('title')}</h1>
      <p className="text-muted mb-8">{t('text')}</p>
      <Link href="/catalog" className="inline-block bg-primary hover:bg-primary-hover text-on-primary font-bold px-6 py-3 rounded-xl transition-colors">
        {t('toCatalog')}
      </Link>
    </div>
  );
}
