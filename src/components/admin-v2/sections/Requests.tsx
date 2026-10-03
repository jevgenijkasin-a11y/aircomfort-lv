'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminRequest } from '@/lib/adminTypes';
import { useAdmin, api, fmtDate } from '../context';
import { Badge, Button, Confirm, Drawer, EmptyState, IconButton, PageHeader, Pagination, Spinner } from '../ui';
import { IconCheck, IconEye, IconInbox, IconMail, IconPhone, IconSearch, IconTrash } from '../icons';

const PER_PAGE = 20;
// Actions stay visible when the table scrolls horizontally
const STICKY_COL = 'sticky right-0 bg-white shadow-[-8px_0_8px_-8px_rgba(16,24,40,0.12)] dark:bg-[#131720]';

export default function Requests() {
  const { t, lang, query } = useAdmin();
  const [rows, setRows] = useState<AdminRequest[] | null>(null);
  const [q, setQ] = useState(query);
  const [onlyNew, setOnlyNew] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<AdminRequest | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = () => api<AdminRequest[]>('/api/admin/requests').then((d) => setRows(d ?? [])).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  useEffect(() => { setQ(query); }, [query]);
  useEffect(() => { setPage(1); }, [q, onlyNew, from, to]);

  // Same PATCH/DELETE calls as the old admin
  const markRead = async (id: number) => {
    await api('/api/admin/requests', { method: 'PATCH', json: { id, status: 'read' } });
    setRows((p) => p?.map((r) => (r.id === id ? { ...r, status: 'read' } : r)) ?? p);
    setOpen((o) => (o?.id === id ? { ...o, status: 'read' } : o));
  };
  const remove = async (id: number) => {
    await api('/api/admin/requests', { method: 'DELETE', json: { id } });
    setRows((p) => p?.filter((r) => r.id !== id) ?? p);
    setConfirmId(null);
    setOpen(null);
  };

  const filtered = useMemo(() => {
    let list = rows ?? [];
    if (onlyNew) list = list.filter((r) => r.status === 'new');
    if (from) list = list.filter((r) => r.created_at.slice(0, 10) >= from);
    if (to) list = list.filter((r) => r.created_at.slice(0, 10) <= to);
    const n = q.trim().toLowerCase();
    if (n) list = list.filter((r) => [r.name, r.phone, r.email, r.service, t.reqSvc[r.service] ?? '', r.message].join(' ').toLowerCase().includes(n));
    return list;
  }, [rows, q, onlyNew, from, to, t]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const newCount = (rows ?? []).filter((r) => r.status === 'new').length;
  const svc = (k: string) => t.reqSvc[k] ?? k;

  return (
    <div>
      <PageHeader title={t.reqTitle} desc={newCount ? `${newCount} ${t.newCount}` : undefined} />
      <div className="card">
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="relative min-w-[220px] flex-1">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="field-input pl-10" placeholder={t.searchPh} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.searchPh} />
          </div>
          <label className="text-theme-xs text-gray-500">{t.dateFrom}
            <input type="date" className="field-input mt-1 h-10" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-theme-xs text-gray-500">{t.dateTo}
            <input type="date" className="field-input mt-1 h-10" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-white/5">
            {[false, true].map((v) => (
              <button key={String(v)} onClick={() => setOnlyNew(v)}
                className={`rounded-md px-3 py-2 text-theme-sm font-medium ${onlyNew === v ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {v ? t.reqOnlyNew : t.all}
              </button>
            ))}
          </div>
        </div>

        {!rows ? <div className="py-16 text-center"><Spinner /></div> : filtered.length === 0 ? (
          <EmptyState title={t.reqEmpty} desc={t.reqEmptyDesc} icon={<IconInbox className="h-6 w-6" />} />
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full text-left text-theme-sm">
              <thead className="border-b border-gray-100 text-theme-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <tr>
                  {[t.reqDate, t.reqName, t.reqPhone, t.reqEmail, t.reqService, t.reqStatus, ''].map((h, i) => (
                    <th key={i} className={`whitespace-nowrap px-4 py-3 font-medium ${i === 6 ? STICKY_COL : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {shown.map((r) => (
                  <tr key={r.id} className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] ${r.status === 'new' ? 'font-medium' : ''}`} onClick={() => setOpen(r)}>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{fmtDate(r.created_at, lang)}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">{r.name}</td>
                    <td className="whitespace-nowrap px-4 py-3"><a href={`tel:${r.phone}`} onClick={(e) => e.stopPropagation()} className="text-brand-600 hover:underline dark:text-accent">{r.phone}</a></td>
                    <td className="px-4 py-3">{r.email && <a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()} className="text-gray-600 hover:underline dark:text-gray-300">{r.email}</a>}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.service && (r.service === 'catalog_order' || r.service === 'favorites' ? <Badge color="info">{svc(r.service)}</Badge> : svc(r.service))}</td>
                    <td className="px-4 py-3"><Badge color={r.status === 'new' ? 'brand' : 'gray'}>{r.status === 'new' ? t.reqNew : t.reqRead}</Badge></td>
                    <td className={`whitespace-nowrap px-2 py-2 text-right ${STICKY_COL}`} onClick={(e) => e.stopPropagation()}>
                      <IconButton label={t.details} onClick={() => setOpen(r)}><IconEye className="h-4 w-4" /></IconButton>
                      {r.status === 'new' && <IconButton label={t.reqMarkRead} onClick={() => markRead(r.id)}><IconCheck className="h-4 w-4" /></IconButton>}
                      <IconButton label={t.del} onClick={() => setConfirmId(r.id)} className="hover:!text-error-500"><IconTrash className="h-4 w-4" /></IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-theme-sm text-gray-500 dark:border-gray-800">
          <span>{filtered.length} / {(rows ?? []).length}</span>
          <Pagination page={page} pages={pages} onPage={setPage} labels={{ prev: t.prev, next: t.next }} />
        </div>
      </div>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.name}
        footer={open && <>
          {open.status === 'new' && <Button onClick={() => markRead(open.id)}><IconCheck className="h-4 w-4" />{t.reqMarkRead}</Button>}
          <Button variant="outline" onClick={() => setConfirmId(open.id)}><IconTrash className="h-4 w-4" />{t.del}</Button>
        </>}>
        {open && (
          <dl className="space-y-4 text-theme-sm">
            <div><dt className="text-gray-500">{t.reqStatus}</dt><dd className="mt-1"><Badge color={open.status === 'new' ? 'brand' : 'gray'}>{open.status === 'new' ? t.reqNew : t.reqRead}</Badge></dd></div>
            <div><dt className="text-gray-500">{t.reqDate}</dt><dd className="mt-1 text-gray-800 dark:text-white/90">{fmtDate(open.created_at, lang)}</dd></div>
            <div><dt className="text-gray-500">{t.reqPhone}</dt><dd className="mt-1"><a href={`tel:${open.phone}`} className="inline-flex items-center gap-2 text-brand-600 dark:text-accent"><IconPhone className="h-4 w-4" />{open.phone}</a></dd></div>
            {open.email && <div><dt className="text-gray-500">{t.reqEmail}</dt><dd className="mt-1"><a href={`mailto:${open.email}`} className="inline-flex items-center gap-2 text-brand-600 dark:text-accent"><IconMail className="h-4 w-4" />{open.email}</a></dd></div>}
            {open.service && <div><dt className="text-gray-500">{t.reqService}</dt><dd className="mt-1 text-gray-800 dark:text-white/90">{svc(open.service)}</dd></div>}
            {!!open.products?.length && (
              <div><dt className="text-gray-500">{t.reqProducts} ({open.products.length})</dt>
                <dd className="mt-1"><ul className="space-y-1.5">
                  {open.products.map((p) => (
                    <li key={p.id} className="flex justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800">
                      <a href={`/ru/catalog/${p.id}`} target="_blank" rel="noopener" className="text-brand-600 hover:underline dark:text-accent">{p.name}</a>
                      <span className="whitespace-nowrap text-gray-600 dark:text-gray-300">{p.price ? `${p.price} €` : t.priceOnRequest}</span>
                    </li>
                  ))}
                </ul></dd></div>
            )}
            {open.install !== null && open.install !== undefined && <div><dt className="text-gray-500">{t.reqInstall}</dt><dd className="mt-1"><Badge color={open.install ? 'success' : 'gray'}>{open.install ? t.reqInstallYes : t.reqInstallNo}</Badge></dd></div>}
            {open.message && <div><dt className="text-gray-500">{t.reqMessage}</dt><dd className="mt-1 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-gray-800 dark:bg-white/[0.03] dark:text-white/90">{open.message}</dd></div>}
          </dl>
        )}
      </Drawer>

      <Confirm open={confirmId !== null} title={t.deleteConfirm} text={t.cannotUndo} confirmLabel={t.confirmDelete} cancelLabel={t.cancel}
        onCancel={() => setConfirmId(null)} onConfirm={() => confirmId !== null && remove(confirmId)} />
    </div>
  );
}
