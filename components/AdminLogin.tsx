'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

export function AdminLogin() {
  const locale = useLocale();
  const ua = locale === 'ua';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!res.ok) {
      setError(ua ? 'Невірний пароль або доступ не налаштований.' : 'Wrong password or admin access is not configured.');
      return;
    }

    window.location.reload();
  }

  return (
    <main className="min-h-[70vh] bg-slate-50 px-3 py-12 sm:px-4 sm:py-20">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-2xl text-white">🔐</div>
        <h1 className="mt-5 text-2xl font-black text-navy sm:text-3xl">{ua ? 'Адмін-панель' : 'Admin panel'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {ua ? 'Вхід для керування замовленнями та виробництвом.' : 'Sign in to manage orders and production.'}
        </p>

        <label className="label mt-6">{ua ? 'Пароль адміністратора' : 'Admin password'}</label>
        <input
          type="password"
          autoComplete="current-password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-accent">{error}</p>}

        <button type="submit" disabled={loading} className="btn-accent mt-5 w-full disabled:opacity-60">
          {loading ? (ua ? 'Входимо…' : 'Signing in…') : (ua ? 'Увійти' : 'Sign in')}
        </button>
      </form>
    </main>
  );
}
