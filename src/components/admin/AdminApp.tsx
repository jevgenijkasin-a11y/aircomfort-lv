'use client';

import { useState, useEffect } from 'react';
import { T, Lang, Section } from './adminStrings';
import AdminRequests from './AdminRequests';
import AdminProducts from './AdminProducts';
import AdminReviews from './AdminReviews';
import AdminTexts from './AdminTexts';
import AdminSettings, { AdminPassword } from './AdminSettings';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#27C4A0] to-[#1A6B9A] flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
          <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
        </svg>
      </div>
      <span className="font-bold text-white text-sm">Air<span className="text-[#27C4A0]">Comfort</span></span>
    </div>
  );
}

const navItems: { id: Section; icon: React.ReactNode }[] = [
  {
    id: 'requests',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  },
  {
    id: 'products',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>,
  },
  {
    id: 'reviews',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
  {
    id: 'texts',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>,
  },
  {
    id: 'settings',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    id: 'password',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
  },
];

export default function AdminApp() {
  const [authState, setAuthState] = useState<'checking' | 'ok' | 'no'>('checking');
  const [lang, setLang] = useState<Lang>('ru');
  const [section, setSection] = useState<Section>('requests');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('adminLang') as Lang | null;
    if (savedLang === 'en' || savedLang === 'ru') setLang(savedLang);

    fetch('/api/admin/auth')
      .then((r) => r.json())
      .then((d) => setAuthState(d.authenticated ? 'ok' : 'no'))
      .catch(() => setAuthState('no'));
  }, []);

  const toggleLang = () => {
    const next = lang === 'ru' ? 'en' : 'ru';
    setLang(next);
    localStorage.setItem('adminLang', next);
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthState('no');
  };

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-[#0B1929] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#27C4A0]/30 border-t-[#27C4A0] rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'no') {
    return <LoginScreen lang={lang} toggleLang={toggleLang} onLogin={() => setAuthState('ok')} />;
  }

  const s = T[lang];

  return (
    <div className="min-h-screen bg-[#0B1929] flex text-white">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`
        fixed lg:relative z-40 h-screen bg-[#0D2137] border-r border-white/8 flex flex-col transition-all duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
      `}>
        <div className={`p-4 border-b border-white/8 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && <Logo />}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'} />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === id
                  ? 'bg-[#27C4A0]/15 text-[#27C4A0]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? s[`nav${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof s] as string : undefined}
            >
              {icon}
              {!sidebarCollapsed && <span>{s[`nav${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof s] as string}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-3 border-t border-white/8 space-y-1`}>
          <button
            onClick={toggleLang}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <span className="text-base">{lang === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
            {!sidebarCollapsed && <span>{lang === 'ru' ? 'Русский' : 'English'}</span>}
          </button>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? s.navLogout : undefined}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!sidebarCollapsed && <span>{s.navLogout}</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-[#0D2137] border-b border-white/8 px-4 py-3 flex items-center justify-between">
          <Logo />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {section === 'requests' && <AdminRequests lang={lang} />}
          {section === 'products' && <AdminProducts lang={lang} />}
          {section === 'reviews' && <AdminReviews lang={lang} />}
          {section === 'texts' && <AdminTexts lang={lang} />}
          {section === 'settings' && <AdminSettings lang={lang} />}
          {section === 'password' && <AdminPassword lang={lang} />}
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ lang, toggleLang, onLogin }: { lang: Lang; toggleLang: () => void; onLogin: () => void }) {
  const s = T[lang];
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const r = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      onLogin();
    } else {
      setStatus('error');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1929] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#27C4A0]/5 blur-[100px]" />
      <div className="absolute top-4 right-4">
        <button onClick={toggleLang} className="px-3 py-1.5 text-sm bg-white/8 hover:bg-white/12 text-white/60 hover:text-white rounded-xl transition-colors border border-white/10">
          {lang === 'ru' ? 'EN' : 'RU'}
        </button>
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#27C4A0] to-[#1A6B9A] mb-5 shadow-xl shadow-[#27C4A0]/20">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              <circle cx="12" cy="12" r="2.5" fill="white" stroke="none" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">{s.loginTitle}</h1>
          <p className="text-white/40 text-sm mt-1">{s.loginDesc}</p>
        </div>

        <form onSubmit={submit} className="bg-white/4 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">{s.passwordLabel}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setStatus('idle'); }}
              className="w-full bg-white/5 border border-white/15 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#27C4A0]/60 transition-colors placeholder-white/20"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {s.loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !password}
            className="w-full bg-[#27C4A0] hover:bg-[#1fa389] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1929] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {s.loginLoading}
              </>
            ) : s.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
