// Server-rendered page links (?page=N) with rel prev/next for listing pages.
import { Link } from '@/i18n/navigation';
import { pagePath, pageItems } from '@/lib/pagination';

const PG = {
  prev: { lv: 'Iepriekšējā', ru: 'Назад', en: 'Previous' },
  next: { lv: 'Nākamā', ru: 'Далее', en: 'Next' },
  label: { lv: 'Lapas', ru: 'Страницы', en: 'Pages' },
};
const btn = 'px-3.5 py-2 rounded-xl text-sm text-muted bg-surface border border-line hover:border-accent/50 hover:text-fg transition-colors';

export default function Pagination({ basePath, page, totalPages, locale }: { basePath: string; page: number; totalPages: number; locale: string }) {
  if (totalPages <= 1) return null;
  const L = (locale === 'ru' || locale === 'en' ? locale : 'lv') as 'lv' | 'ru' | 'en';
  const href = (n: number) => pagePath(basePath, n) as '/catalog';
  return (
    <nav aria-label={PG.label[L]} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link href={href(page - 1)} rel="prev" className={btn}>← {PG.prev[L]}</Link>}
      {pageItems(page, totalPages).map((it, i) =>
        'gap' in it ? (
          <span key={`g${i}`} aria-hidden="true" className="sm:hidden px-1 text-muted">…</span>
        ) : it.n === page ? (
          <span key={it.n} aria-current="page" className="min-w-[40px] text-center px-3 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary">{it.n}</span>
        ) : (
          <Link key={it.n} href={href(it.n)} className={`min-w-[40px] text-center ${btn} ${it.compact ? '' : 'hidden sm:inline-block'}`}>{it.n}</Link>
        ),
      )}
      {page < totalPages && <Link href={href(page + 1)} rel="next" className={btn}>{PG.next[L]} →</Link>}
    </nav>
  );
}
