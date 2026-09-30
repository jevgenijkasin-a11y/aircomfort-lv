'use client';

// /admin-v2 shell: login, sidebar, header, section switching (#hash).
// Layout ported from TailAdmin (MIT). Uses the same /api/admin/* endpoints and
// the same session cookie as the old /admin.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DICT, type Lang } from './i18n';
import { Ctx, type Section, type AdminCtx } from './context';
import { Spinner, useToast, Dropdown } from './ui';
import {
  Logo, IconGrid, IconInbox, IconBox, IconTree, IconImage, IconUser, IconChat, IconText, IconCog, IconKey,
  IconBack, IconLogout, IconSearch, IconMoon, IconSun, IconMenu, IconX, IconExternal,
} from './icons';
import Dashboard from './sections/Dashboard';
import Requests from './sections/Requests';
import Products from './sections/Products';
import Categories from './sections/Categories';
import Slider from './sections/Slider';
import Cards from './sections/Cards';
import Reviews from './sections/Reviews';
import Texts from './sections/Texts';
import Settings from './sections/Settings';
import Password from './sections/Password';

const NAV: { id: Section; icon: (p: { className?: string }) => JSX.Element; key: keyof typeof DICT.ru }[] = [
  { id: 'dashboard', icon: IconGrid, key: 'navDashboard' },
  { id: 'requests', icon: IconInbox, key: 'navRequests' },
  { id: 'products', icon: IconBox, key: 'navProducts' },
  { id: 'categories', icon: IconTree, key: 'navCategories' },
  { id: 'slider', icon: IconImage, key: 'navSlider' },
  { id: 'cards', icon: IconUser, key: 'navCards' },
  { id: 'reviews', icon: IconChat, key: 'navReviews' },
  { id: 'texts', icon: IconText, key: 'navTexts' },
  { id: 'settings', icon: IconCog, key: 'navSettings' },
  { id: 'password', icon: IconKey, key: 'navPassword' },
];
const SECTIONS = NAV.map((n) => n.id);
const readHash = (): Section => {
  const h = (typeof window !== 'undefined' ? window.location.hash.slice(1) : '') as Section;
  return SECTIONS.includes(h) ? h : 'dashboard';
};

export default function AdminV2App() {
  const [auth, setAuth] = useState<'checking' | 'ok' | 'no'>('checking');
  const [lang, setLangState] = useState<Lang>('ru');
  const [dark, setDark] = useState(false);
  const [section, setSection] = useState<Section>('dashboard');
  const [query, setQuery] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast, toastNode } = useToast();
  const t = DICT[lang];

  useEffect(() => {
    try {
      const l = localStorage.getItem('adminV2Lang');
      if (l === 'ru' || l === 'lv' || l === 'en') setLangState(l);
    } catch { /* storage blocked */ }
    setDark(document.documentElement.classList.contains('dark'));
    setSection(readHash());
    const onHash = () => setSection(readHash());
    window.addEventListener('hashchange', onHash);
    fetch('/api/admin/auth').then((r) => r.json()).then((d) => setAuth(d.authenticated ? 'ok' : 'no')).catch(() => setAuth('no'));
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem('adminV2Lang', l); } catch { /* */ } };
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('adminV2Theme', next ? 'dark' : 'light'); } catch { /* */ }
  };

  const go = useCallback<AdminCtx['go']>((s, opts) => {
    if (opts?.q !== undefined) setQuery(opts.q);
    setEditId(opts?.edit ?? null);
    setSection(s);
    setMobileOpen(false);
    if (window.location.hash !== `#${s}`) window.history.pushState(null, '', `#${s}`);
    window.scrollTo({ top: 0 });
  }, []);

  const ctx = useMemo<AdminCtx>(() => ({
    t, lang, go, query, setQuery, editId, clearEdit: () => setEditId(null), toast,
  }), [t, lang, go, query, editId, toast]);

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuth('no');
  };

  if (auth === 'checking') {
    return <div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }
  if (auth === 'no') {
    return <Login t={t} lang={lang} setLang={setLang} dark={dark} toggleTheme={toggleTheme} onLogin={() => setAuth('ok')} />;
  }

  const body: Record<Section, ReactNode> = {
    dashboard: <Dashboard />, requests: <Requests />, products: <Products />, categories: <Categories />,
    slider: <Slider />, cards: <Cards />, reviews: <Reviews />, texts: <Texts />, settings: <Settings />, password: <Password />,
  };

  return (
    <Ctx.Provider value={ctx}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {mobileOpen && <div className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
        <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-200 bg-white px-4 transition-transform dark:border-gray-800 dark:bg-navy lg:sticky lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-[72px] items-center justify-between">
            <a href="#dashboard" className="flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); go('dashboard'); }}>
              <Logo />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Air<span className="text-brand-500 dark:text-accent">Comfort</span></span>
            </a>
            <button className="rounded-lg p-2 text-gray-500 lg:hidden" onClick={() => setMobileOpen(false)} aria-label={t.close}><IconX /></button>
          </div>
          <nav className="custom-scrollbar -mx-1 flex-1 overflow-y-auto px-1 pb-4">
            <p className="mb-2 px-3 text-theme-xs uppercase tracking-wider text-gray-400">{t.menu}</p>
            <ul className="space-y-1">
              {NAV.map(({ id, icon: Icon, key }) => {
                const active = section === id;
                return (
                  <li key={id}>
                    <a href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} aria-current={active ? 'page' : undefined}
                      className={`group menu-item ${active ? 'menu-item-active' : 'menu-item-inactive'}`}>
                      <Icon className={`h-5 w-5 ${active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}`} />
                      {t[key]}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
              <a href="/admin" className="group menu-item menu-item-inactive">
                <IconBack className="h-5 w-5 menu-item-icon-inactive" />
                {t.navOldAdmin}
              </a>
              <a href="/" target="_blank" rel="noopener" className="group menu-item menu-item-inactive">
                <IconExternal className="h-5 w-5 menu-item-icon-inactive" />
                {t.openSite}
              </a>
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
            <button className="rounded-lg border border-gray-200 p-2.5 text-gray-500 dark:border-gray-800 dark:text-gray-400 lg:hidden" onClick={() => setMobileOpen(true)} aria-label={t.menu}><IconMenu /></button>
            <form className="relative hidden max-w-md flex-1 sm:block" role="search"
              onSubmit={(e) => { e.preventDefault(); go(section === 'requests' ? 'requests' : 'products', { q: query }); }}>
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search}
                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent pl-12 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90" />
            </form>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-white/5" role="group" aria-label="Language">
                {(['ru', 'lv', 'en'] as Lang[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                    className={`rounded-md px-2.5 py-1.5 text-theme-xs font-semibold ${lang === l ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={toggleTheme} aria-label={dark ? t.themeLight : t.themeDark} title={dark ? t.themeLight : t.themeDark}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5">
                {dark ? <IconSun /> : <IconMoon />}
              </button>
              <Dropdown trigger={() => (
                <button className="flex h-11 items-center gap-2 rounded-full border border-gray-200 pl-1 pr-3 dark:border-gray-800" aria-label="Account">
                  <Logo className="h-9 w-9" />
                  <span className="hidden text-theme-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">Admin</span>
                </button>
              )}>
                <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10">
                  <IconLogout /> {t.logout}
                </button>
              </Dropdown>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1536px] flex-1 p-4 md:p-6">{body[section]}</main>
        </div>
      </div>
      {toastNode}
    </Ctx.Provider>
  );
}

function Login({ t, lang, setLang, dark, toggleTheme, onLogin }: {
  t: (typeof DICT)['ru']; lang: Lang; setLang: (l: Lang) => void; dark: boolean; toggleTheme: () => void; onLogin: () => void;
}) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const r = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (r.ok) onLogin(); else { setStatus('error'); setPassword(''); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4 flex gap-2">
        {(['ru', 'lv', 'en'] as Lang[]).map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`rounded-md px-2.5 py-1.5 text-theme-xs font-semibold ${lang === l ? 'bg-brand-500 text-white' : 'text-gray-500'}`}>{l.toUpperCase()}</button>
        ))}
        <button onClick={toggleTheme} aria-label={dark ? t.themeLight : t.themeDark} className="rounded-full p-2 text-gray-500">{dark ? <IconSun /> : <IconMoon />}</button>
      </div>
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{t.loginTitle}</h1>
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">{t.loginDesc}</p>
          </div>
        </div>
        <label className="field-label" htmlFor="v2-pw">{t.password}</label>
        <input id="v2-pw" type="password" className="field-input" value={password} autoFocus
          onChange={(e) => { setPassword(e.target.value); setStatus('idle'); }} />
        {status === 'error' && <p className="field-error" role="alert">{t.loginError}</p>}
        <button type="submit" disabled={!password || status === 'loading'}
          className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
          {status === 'loading' ? t.loginLoading : t.loginBtn}
        </button>
      </form>
    </div>
  );
}
