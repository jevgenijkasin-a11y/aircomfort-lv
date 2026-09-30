'use client';

// Read-only dashboard (metric cards + chart ported from TailAdmin ecommerce page).
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { useAdmin, api, fmtDate } from '../context';
import { Card, Badge, PageHeader, Spinner, EmptyState } from '../ui';
import { IconInbox, IconBox, IconImage, IconWarn, IconCheck } from '../icons';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Req = { id: number; name: string; phone: string; service: string; status: string; created_at: string };
type Data = {
  requests: { today: number; last7: number; last30: number; unread: number; perDay: { date: string; count: number }[]; recent: Req[] };
  products: { total: number; noPhoto: number; issues: { id: string; name: string; brand: string; reason: 'noPhoto' | 'broken' }[] };
};

function Metric({ label, value, icon, tone = 'gray', onClick }: { label: string; value: number; icon: React.ReactNode; tone?: 'gray' | 'brand' | 'warning'; onClick?: () => void }) {
  const toneCls = tone === 'brand' ? 'bg-brand-50 text-brand-600 dark:bg-accent/15 dark:text-accent'
    : tone === 'warning' ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`card p-5 text-left md:p-6 ${onClick ? 'transition hover:border-brand-300 dark:hover:border-brand-700' : ''}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneCls}`}>{icon}</div>
      <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{value}</p>
    </Tag>
  );
}

export default function Dashboard() {
  const { t, lang, go } = useAdmin();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    api<Data>('/api/admin-v2/dashboard').then(setData).catch((e) => setErr(e.message));
    const read = () => setDark(document.documentElement.classList.contains('dark'));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  if (err) return <p className="text-error-500">{t.error}: {err}</p>;
  if (!data) return <div className="py-20 text-center"><Spinner className="h-8 w-8" /></div>;

  const r = data.requests;
  const loc = lang === 'lv' ? 'lv-LV' : lang === 'en' ? 'en-GB' : 'ru-RU';
  const options: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    colors: ['#0B7A63'],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    grid: { borderColor: dark ? '#1d2939' : '#e4e7ec', yaxis: { lines: { show: true } } },
    xaxis: {
      categories: r.perDay.map((d) => new Date(d.date + 'T12:00:00').toLocaleDateString(loc, { day: '2-digit', month: '2-digit' })),
      labels: { style: { colors: dark ? '#98a2b3' : '#667085', fontSize: '11px' }, rotate: -45, hideOverlappingLabels: true },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: [dark ? '#98a2b3' : '#667085'] }, formatter: (v) => String(Math.round(v)) }, min: 0, forceNiceScale: true },
    tooltip: { theme: dark ? 'dark' : 'light', y: { formatter: (v) => String(v) } },
    theme: { mode: dark ? 'dark' : 'light' },
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t.dashTitle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-6">
        <Metric label={t.reqToday} value={r.today} icon={<IconInbox className="h-6 w-6" />} tone="brand" onClick={() => go('requests')} />
        <Metric label={t.req7} value={r.last7} icon={<IconInbox className="h-6 w-6" />} onClick={() => go('requests')} />
        <Metric label={t.req30} value={r.last30} icon={<IconInbox className="h-6 w-6" />} onClick={() => go('requests')} />
        <Metric label={t.reqNewUnread} value={r.unread} icon={<IconWarn className="h-6 w-6" />} tone={r.unread ? 'warning' : 'gray'} onClick={() => go('requests')} />
        <Metric label={t.productsTotal} value={data.products.total} icon={<IconBox className="h-6 w-6" />} onClick={() => go('products')} />
        <Metric label={t.productsNoPhoto} value={data.products.noPhoto} icon={<IconImage className="h-6 w-6" />} tone={data.products.noPhoto ? 'warning' : 'gray'} />
      </div>

      <Card title={t.chartTitle} desc={t.chartSub}>
        <div className="-ml-3 min-h-[280px]">
          <Chart key={String(dark)} options={options} series={[{ name: t.navRequests, data: r.perDay.map((d) => d.count) }]} type="bar" height={280} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={t.recentReq} actions={<button className="text-theme-sm font-medium text-brand-600 hover:underline dark:text-accent" onClick={() => go('requests')}>{t.viewAll}</button>}>
          {r.recent.length === 0 ? <EmptyState title={t.reqEmpty} /> : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {r.recent.map((q) => (
                <li key={q.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 dark:text-white/90">{q.name}</p>
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">{q.phone}{q.service ? ` · ${q.service}` : ''}</p>
                  </div>
                  <span className="text-theme-xs text-gray-500 dark:text-gray-400">{fmtDate(q.created_at, lang)}</span>
                  <Badge color={q.status === 'new' ? 'brand' : 'gray'}>{q.status === 'new' ? t.reqNew : t.reqRead}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t.photoIssues} desc={data.products.issues.length ? `${data.products.issues.length}` : undefined}>
          {data.products.issues.length === 0 ? (
            <EmptyState title={t.allGood} icon={<IconCheck className="h-6 w-6" />} />
          ) : (
            <ul className="custom-scrollbar max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
              {data.products.issues.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 dark:text-white/90">{p.name}</p>
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">{p.brand}</p>
                  </div>
                  <Badge color={p.reason === 'broken' ? 'error' : 'warning'}>{p.reason === 'broken' ? t.brokenPhoto : t.noPhoto}</Badge>
                  <button onClick={() => go('products', { edit: p.id })} className="text-theme-sm font-medium text-brand-600 hover:underline dark:text-accent">{t.edit}</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
