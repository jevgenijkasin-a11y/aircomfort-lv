'use client';

import { useState } from 'react';
import { useAdmin } from '../context';
import { Button, Card, Field, PageHeader } from '../ui';
import { IconCheck } from '../icons';

type Status = 'idle' | 'saving' | 'success' | 'error' | 'mismatch' | 'short';

export default function Password() {
  const { t } = useAdmin();
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [status, setStatus] = useState<Status>('idle');

  // Same checks and PUT /api/admin/password as the old admin
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPwd.length < 6) { setStatus('short'); return; }
    if (form.newPwd !== form.confirm) { setStatus('mismatch'); return; }
    setStatus('saving');
    const r = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd }),
    });
    if (r.ok) {
      setStatus('success');
      setForm({ current: '', newPwd: '', confirm: '' });
      // The session is bound to the password hash, so it ends now: go to the
      // login screen instead of letting the next action fail with 401.
      setTimeout(() => window.location.reload(), 1500);
    } else setStatus('error');
  };
  const err = status === 'error' ? t.pwdError : status === 'mismatch' ? t.pwdMismatch : status === 'short' ? t.pwdShort : '';
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, [k]: e.target.value }); setStatus('idle'); };

  return (
    <div className="max-w-xl">
      <PageHeader title={t.pwdTitle} />
      <Card>
        <form onSubmit={change} className="space-y-4">
          <Field label={t.pwdCurrent}><input type="password" className="field-input" value={form.current} onChange={set('current')} autoComplete="current-password" /></Field>
          <Field label={t.pwdNew} hint={t.pwdShort}><input type="password" className="field-input" value={form.newPwd} onChange={set('newPwd')} autoComplete="new-password" /></Field>
          <Field label={t.pwdConfirm}><input type="password" className="field-input" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" /></Field>
          {err && <p className="rounded-lg bg-error-50 px-3 py-2 text-theme-sm text-error-600 dark:bg-error-500/15 dark:text-error-400" role="alert">{err}</p>}
          {status === 'success' && <p className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-theme-sm text-success-700 dark:bg-success-500/15 dark:text-success-500" role="status"><IconCheck className="h-4 w-4" />{t.pwdChanged}</p>}
          <Button type="submit" disabled={status === 'saving' || !form.current || !form.newPwd || !form.confirm}>{status === 'saving' ? t.saving : t.pwdChange}</Button>
        </form>
      </Card>
    </div>
  );
}
