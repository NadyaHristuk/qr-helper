'use client';

import { useEffect, useId, useState } from 'react';
import { useLocale } from 'next-intl';

type DynamicQr = {
  id: string;
  slug: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type DynamicQrList = { dynamicQrs: DynamicQr[]; nextCursor?: string | null };

class RequestError extends Error {
  constructor(readonly status: number) {
    super('Dynamic QR request failed');
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new RequestError(response.status);
  return response.json() as Promise<T>;
}

function errorMessage(error: unknown, ua: boolean): string {
  if (error instanceof RequestError) {
    if (error.status === 401) return ua ? 'Сесію завершено. Увійдіть в адмінку ще раз.' : 'Your session has expired. Sign in again.';
    if (error.status === 400) return ua
      ? 'Вкажіть HTTPS-адресу без логіна й пароля. Посилання /q/ цього сервісу не дозволені.'
      : 'Enter an HTTPS URL without credentials. This service’s /q/ links are not allowed.';
    if (error.status === 429) return ua ? 'Забагато запитів. Спробуйте трохи пізніше.' : 'Too many requests. Please try again shortly.';
  }
  return ua ? 'Не вдалося виконати дію. Спробуйте ще раз.' : 'Could not complete the request. Please try again.';
}

export function DynamicQrAdmin({ publicOrigin }: { publicOrigin?: string }) {
  const ua = useLocale() === 'ua';
  const createTargetId = useId();
  const helpId = useId();
  const [records, setRecords] = useState<DynamicQr[]>([]);
  const [origin, setOrigin] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<unknown>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setOrigin(publicOrigin ?? window.location.origin);

    async function load() {
      try {
        const response = await fetch('/api/admin/dynamic-qr', { cache: 'no-store', signal: controller.signal });
        const data = await readResponse<DynamicQrList>(response);
        if (controller.signal.aborted) return;
        setRecords(data.dynamicQrs);
        setNextCursor(data.nextCursor ?? null);
      } catch (error) {
        if (!controller.signal.aborted) setListError(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [publicOrigin]);

  async function loadList(cursor?: string) {
    const append = Boolean(cursor);
    if (append) setLoadingMore(true);
    else setLoading(true);
    setListError(null);
    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const data = await readResponse<DynamicQrList>(await fetch(`/api/admin/dynamic-qr${query}`, { cache: 'no-store' }));
      setRecords((current) => append
        ? [...current, ...data.dynamicQrs.filter((item) => !current.some((existing) => existing.id === item.id))]
        : data.dynamicQrs);
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      setListError(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreated(false);
    try {
      const data = await readResponse<{ dynamicQr: DynamicQr }>(await fetch('/api/admin/dynamic-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: targetUrl.trim() }),
      }));
      setRecords((current) => [data.dynamicQr, ...current]);
      setTargetUrl('');
      setCreated(true);
    } catch (error) {
      setCreateError(error);
    } finally {
      setCreating(false);
    }
  }

  function updateRecord(record: DynamicQr) {
    setRecords((current) => current.map((item) => item.id === record.id ? record : item));
  }

  return (
    <section aria-labelledby="dynamic-qr-heading" className="mt-10 min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 id="dynamic-qr-heading" className="text-2xl font-black text-navy">Dynamic QR</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {ua
          ? 'Постійна публічна адреса QR зі змінним призначенням. Після зміни адреси передруковувати QR не потрібно.'
          : 'A stable public QR URL with an editable destination. Change the destination without reprinting the QR.'}
      </p>

      {!publicOrigin ? <p className="mt-3 text-sm text-amber-700">{ua ? 'Адреси нижче використовують поточний хост для перевірки. Перед друком налаштуйте постійний публічний домен.' : 'These URLs use the current host for testing. Configure a permanent public domain before printing.'}</p> : null}
      <form onSubmit={create} className="mt-5 min-w-0 rounded-2xl bg-slate-50 p-3 sm:p-4">
        <h3 className="font-bold text-navy">{ua ? 'Створити Dynamic QR' : 'Create Dynamic QR'}</h3>
        <label htmlFor={createTargetId} className="label mt-3">{ua ? 'Адреса призначення' : 'Destination URL'}</label>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
          <input
            id={createTargetId}
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            pattern="https://.*"
            maxLength={2048}
            placeholder="https://example.com"
            aria-describedby={helpId}
            required
            className="input sm:flex-1"
            value={targetUrl}
            onChange={(event) => { setTargetUrl(event.target.value); setCreated(false); }}
            disabled={creating}
          />
          <button type="submit" disabled={creating || loading} className="btn-accent shrink-0 disabled:opacity-60">
            {creating ? (ua ? 'Створюємо…' : 'Creating…') : (ua ? 'Створити' : 'Create')}
          </button>
        </div>
        <p id={helpId} className="mt-2 text-xs leading-5 text-slate-500">
          {ua ? 'Лише HTTPS, без логіна й пароля. Публічну адресу /q/ згенерує сервер.' : 'HTTPS only, without credentials. The server generates the public /q/ URL.'}
        </p>
        {createError ? <p role="alert" className="mt-3 text-sm text-red-700">{errorMessage(createError, ua)}</p> : null}
        {created ? <p role="status" className="mt-3 text-sm text-green-700">{ua ? 'Dynamic QR створено. Скопіюйте публічну адресу нижче.' : 'Dynamic QR created. Copy its public URL below.'}</p> : null}
      </form>

      {loading ? <p role="status" className="mt-5 text-sm text-slate-500">{ua ? 'Завантаження Dynamic QR…' : 'Loading Dynamic QR…'}</p> : null}
      {listError ? (
        <div className="mt-5 rounded-xl bg-red-50 p-3">
          <p role="alert" className="text-sm text-red-700">{errorMessage(listError, ua)}</p>
          <button type="button" onClick={() => void loadList(nextCursor ?? undefined)} disabled={loading || loadingMore} className="btn-outline mt-3 w-full sm:w-auto disabled:opacity-60">
            {ua ? 'Спробувати ще раз' : 'Try again'}
          </button>
        </div>
      ) : null}
      {!loading && !listError && records.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
          {ua ? 'Dynamic QR ще немає. Створіть перший вище.' : 'No Dynamic QR links yet. Create the first one above.'}
        </p>
      ) : null}

      <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
        {records.map((record) => <DynamicQrCard key={record.id} record={record} origin={origin} ua={ua} onUpdated={updateRecord} />)}
      </div>
      {nextCursor && !listError ? (
        <button type="button" onClick={() => void loadList(nextCursor)} disabled={loadingMore || loading} className="btn-outline mt-5 w-full sm:w-auto disabled:opacity-60">
          {loadingMore ? (ua ? 'Завантаження…' : 'Loading…') : (ua ? 'Завантажити ще' : 'Load more')}
        </button>
      ) : null}
    </section>
  );
}

function DynamicQrCard({ record, origin, ua, onUpdated }: {
  record: DynamicQr;
  origin: string;
  ua: boolean;
  onUpdated: (record: DynamicQr) => void;
}) {
  const targetId = useId();
  const [editing, setEditing] = useState(false);
  const [draftTarget, setDraftTarget] = useState(record.targetUrl);
  const [pending, setPending] = useState<'target' | 'active' | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [copyMessage, setCopyMessage] = useState<'copied' | 'failed' | null>(null);
  const publicUrl = origin ? `${origin}/q/${record.slug}` : '';

  async function update(changes: { targetUrl?: string; active?: boolean }, action: 'target' | 'active') {
    setPending(action);
    setError(null);
    try {
      const data = await readResponse<{ dynamicQr: DynamicQr }>(await fetch(`/api/admin/dynamic-qr/${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      }));
      onUpdated(data.dynamicQr);
      if (action === 'target') setEditing(false);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setPending(null);
    }
  }

  async function copyPublicUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyMessage('copied');
    } catch {
      setCopyMessage('failed');
    }
  }

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 p-3 sm:p-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <h3 className="min-w-0 break-all font-mono text-base font-bold text-navy">{record.slug}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {record.active ? (ua ? 'Активний' : 'Active') : (ua ? 'Неактивний' : 'Inactive')}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {ua ? 'Створено: ' : 'Created: '}
        <time dateTime={record.createdAt}>{new Intl.DateTimeFormat(ua ? 'uk-UA' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.createdAt))}</time>
      </p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{ua ? 'Поточна адреса призначення' : 'Current destination'}</p>
      <a href={record.targetUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block min-h-11 max-w-full break-all py-2 text-sm text-navy underline decoration-slate-300 underline-offset-2">
        {record.targetUrl}
      </a>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{ua ? 'Публічна адреса для QR' : 'Public URL for the QR'}</p>
      <p className="mt-2 break-all rounded-xl bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700" dir="ltr">{publicUrl || `/q/${record.slug}`}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={() => void copyPublicUrl()} disabled={!publicUrl} className="btn-outline min-w-0 px-3 disabled:opacity-60">{ua ? 'Скопіювати URL' : 'Copy public URL'}</button>
        {!editing ? <button type="button" onClick={() => { setDraftTarget(record.targetUrl); setError(null); setEditing(true); }} disabled={pending !== null} className="btn-outline min-w-0 px-3 disabled:opacity-60">{ua ? 'Змінити адресу' : 'Edit destination'}</button> : null}
        <button type="button" onClick={() => void update({ active: !record.active }, 'active')} disabled={pending !== null} className="btn-outline min-w-0 px-3 disabled:opacity-60">
          {pending === 'active' ? (ua ? 'Збереження…' : 'Saving…') : record.active ? (ua ? 'Деактивувати' : 'Deactivate') : (ua ? 'Активувати' : 'Activate')}
        </button>
      </div>
      {copyMessage ? <p role="status" className="mt-3 text-sm text-slate-600">{copyMessage === 'copied'
        ? (ua ? 'Публічну адресу скопійовано.' : 'Public URL copied.')
        : (ua ? 'Не вдалося скопіювати автоматично. Скопіюйте публічну адресу вище вручну.' : 'Automatic copying failed. Copy the public URL above manually.')}</p> : null}

      {editing ? (
        <form onSubmit={(event) => { event.preventDefault(); void update({ targetUrl: draftTarget.trim() }, 'target'); }} className="mt-4 border-t border-slate-200 pt-4">
          <label htmlFor={targetId} className="label">{ua ? 'Нова адреса призначення (HTTPS)' : 'New destination URL (HTTPS)'}</label>
          <input id={targetId} type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} pattern="https://.*" maxLength={2048} required value={draftTarget} onChange={(event) => setDraftTarget(event.target.value)} disabled={pending !== null} className="input" />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={pending !== null} className="btn-accent disabled:opacity-60">{pending === 'target' ? (ua ? 'Збереження…' : 'Saving…') : (ua ? 'Зберегти адресу' : 'Save destination')}</button>
            <button type="button" onClick={() => { setEditing(false); setError(null); }} disabled={pending !== null} className="btn-outline disabled:opacity-60">{ua ? 'Скасувати' : 'Cancel'}</button>
          </div>
        </form>
      ) : null}
      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{errorMessage(error, ua)}</p> : null}
    </article>
  );
}
