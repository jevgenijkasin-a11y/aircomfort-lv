'use client';

import { useState, useEffect } from 'react';
import { T, Lang, AdminRequest } from './adminStrings';
import { supabase } from '@/lib/supabase';

export default function AdminRequests({ lang }: { lang: Lang }) {
  const s = T[lang];
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new'>('all');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data ?? []) as AdminRequest[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await supabase.from('contacts').update({ status: 'read' }).eq('id', id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'read' } : r)));
  };

  const deleteRequest = async (id: number) => {
    await supabase.from('contacts').delete().eq('id', id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setConfirmId(null);
  };

  const visible = filter === 'new' ? requests.filter((r) => r.status === 'new') : requests;
  const newCount = requests.filter((r) => r.status === 'new').length;
  const isNew = (r: AdminRequest) => r.status === 'new';

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('ru-RU')} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{s.reqTitle}</h1>
          {newCount > 0 && (
            <p className="text-sm text-[#27C4A0] mt-0.5">{newCount} {lang === 'ru' ? 'новых' : 'new'}</p>
          )}
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
          {(['all', 'new'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${filter === f ? 'bg-[#27C4A0] text-[#0B1929]' : 'text-white/50 hover:text-white'}`}
            >
              {f === 'all' ? s.reqFilterAll : s.reqFilterNew}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/40">{s.loading}</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-white/40 font-medium">{s.reqEmpty}</p>
          <p className="text-white/20 text-sm mt-1">{s.reqEmptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((req) => (
            <div
              key={req.id}
              className={`rounded-2xl border transition-all ${isNew(req) ? 'bg-[#27C4A0]/5 border-[#27C4A0]/20' : 'bg-white/3 border-white/8'}`}
            >
              <div className="p-4 flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isNew(req) ? 'bg-[#27C4A0]' : 'bg-white/20'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-white">{req.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isNew(req) ? 'bg-[#27C4A0]/20 text-[#27C4A0]' : 'bg-white/10 text-white/40'}`}>
                      {isNew(req) ? s.reqNew : s.reqRead}
                    </span>
                    {req.service && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50">{req.service}</span>
                    )}
                    <span className="text-white/30 text-xs ml-auto">{fmt(req.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
                    <a href={`tel:${req.phone}`} className="text-[#27C4A0] text-sm hover:underline">{req.phone}</a>
                    {req.email && <a href={`mailto:${req.email}`} className="text-white/50 text-sm hover:text-white">{req.email}</a>}
                  </div>
                  {req.message && (
                    <button
                      onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                      className="text-white/40 text-xs mt-1.5 hover:text-white/60 transition-colors flex items-center gap-1"
                    >
                      {expanded === req.id ? '▲' : '▼'} {s.reqColMsg}
                    </button>
                  )}
                  {expanded === req.id && req.message && (
                    <p className="mt-2 text-white/60 text-sm bg-white/5 rounded-lg p-3 leading-relaxed">{req.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isNew(req) && (
                    <button
                      onClick={() => markRead(req.id)}
                      title={s.reqMarkRead}
                      className="p-2 rounded-lg bg-[#27C4A0]/10 text-[#27C4A0] hover:bg-[#27C4A0]/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmId(req.id)}
                    title={s.reqDelete}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D2137] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <p className="text-white font-semibold text-lg mb-5">{s.reqDelete}?</p>
            <div className="flex gap-3">
              <button onClick={() => deleteRequest(confirmId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors">{s.confirm}</button>
              <button onClick={() => setConfirmId(null)} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 rounded-xl transition-colors">{s.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
