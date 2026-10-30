'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { parseOrderItems } from '@/lib/orders/items';
import { DynamicQrAdmin } from '@/components/DynamicQrAdmin';

type AdminOrder = {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  template: string;
  priceKop: number;
  customerName: string;
  customerPhone: string;
  city: string;
  npOffice: string;
  customerNote: string;
  deliveryMethod: string;
  paymentMethod: string;
  itemsJson: string;
};


const STATUSES = ['created', 'confirmed', 'in_production', 'ready', 'shipped', 'completed', 'cancelled'] as const;

const statusClass: Record<string, string> = {
  created: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-blue-50 text-blue-700',
  in_production: 'bg-amber-50 text-amber-700',
  ready: 'bg-violet-50 text-violet-700',
  shipped: 'bg-cyan-50 text-cyan-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function AdminDashboard({ initialOrders, dynamicQrPublicOrigin }: { initialOrders: AdminOrder[]; dynamicQrPublicOrigin?: string }) {
  const locale = useLocale();
  const ua = locale === 'ua';
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (!q) return true;
      return [order.id, order.customerName, order.customerPhone, order.city, order.npOffice]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [orders, filter, query]);

  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length;
  const production = orders.filter((o) => o.status === 'in_production').length;
  const ready = orders.filter((o) => o.status === 'ready').length;

  async function updateStatus(id: number, status: string) {
    setSavingId(id);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const { order } = await res.json();
      setOrders((all) => all.map((o) => (o.id === id ? order : o)));
    } catch {
      setSaveError(ua ? 'Не вдалося змінити статус. Спробуйте ще раз.' : 'Could not update status. Please try again.');
    } finally {
      setSavingId(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">QR Helper</p>
            <h1 className="mt-1 text-3xl font-black text-navy">{ua ? 'Адмін-панель' : 'Admin dashboard'}</h1>
            <p className="mt-2 text-sm text-slate-600">{ua ? 'Замовлення, виробництво та відправлення.' : 'Orders, production and shipping.'}</p>
          </div>
          <button type="button" className="btn-outline" onClick={logout}>{ua ? 'Вийти' : 'Sign out'}</button>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={ua ? 'Усього замовлень' : 'Total orders'} value={orders.length} />
          <Stat label={ua ? 'Активні' : 'Active'} value={active} />
          <Stat label={ua ? 'У виробництві' : 'In production'} value={production} />
          <Stat label={ua ? 'Готові' : 'Ready'} value={ready} />
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              className="input"
              placeholder={ua ? 'Пошук: №, імʼя, телефон, місто…' : 'Search: #, name, phone, city…'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">{ua ? 'Усі статуси' : 'All statuses'}</option>
              {STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, ua)}</option>)}
            </select>
          </div>
        </section>

        {saveError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{saveError}</p>}
        <div className="mt-6 space-y-4">
          {visible.map((order) => {
            const items = parseOrderItems(order.itemsJson);
            return (
              <article key={order.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid gap-4 border-b border-slate-200 p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-all text-xl font-black text-navy">#{order.id} · {order.customerName}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {statusLabel(order.status, ua)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {new Intl.DateTimeFormat(ua ? 'uk-UA' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <select
                    className="input min-w-0 lg:w-52"
                    value={order.status}
                    disabled={savingId !== null}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    {STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status, ua)}</option>)}
                  </select>
                </div>

                <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="space-y-3 text-sm">
                    <Info label={ua ? 'Телефон' : 'Phone'} value={order.customerPhone} />
                    <Info label={ua ? 'Доставка' : 'Delivery'} value={`${deliveryLabel(order.deliveryMethod, ua)} · ${order.city}, ${order.npOffice}`} />
                    <Info label={ua ? 'Оплата' : 'Payment'} value={paymentLabel(order.paymentMethod, ua)} />
                    <Info label={ua ? 'Шаблон' : 'Template'} value={order.template} />
                    {order.customerNote && <Info label={ua ? 'Коментар' : 'Note'} value={order.customerNote} />}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-navy">{ua ? `Позиції (${items.length})` : `Items (${items.length})`}</h3>
                    <div className="mt-3 grid gap-2">
                      {items.map((item, index) => (
                        <div key={index} className="min-w-0 break-words rounded-2xl bg-slate-50 p-3 text-sm">
                          <div className="flex items-start gap-3">
                            <span className="text-xl" aria-hidden>{item.icon ?? '🏷️'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-navy">{item.label || item.type || (ua ? 'Наліпка' : 'Sticker')}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {[item.productType, item.size, item.quantity ? `×${item.quantity}` : null, item.shape, item.template]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            {ua ? 'Замовлень за цим фільтром немає.' : 'No orders match this filter.'}
          </div>
        )}

        <DynamicQrAdmin publicOrigin={dynamicQrPublicOrigin} />
      </div>
    </main>
  );
}


function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-navy">{value}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words font-medium text-slate-700">{value}</p></div>;
}

function statusLabel(status: string, ua: boolean): string {
  const labels: Record<string, [string, string]> = {
    created: ['Нове', 'New'], confirmed: ['Підтверджено', 'Confirmed'], in_production: ['У виробництві', 'In production'],
    ready: ['Готове', 'Ready'], shipped: ['Відправлено', 'Shipped'], completed: ['Завершено', 'Completed'], cancelled: ['Скасовано', 'Cancelled'],
  };
  const pair = labels[status];
  return pair ? pair[ua ? 0 : 1] : status;
}

function deliveryLabel(value: string, ua: boolean): string {
  const labels: Record<string, [string, string]> = { nova_poshta: ['Нова Пошта', 'Nova Poshta'], pickup: ['Самовивіз', 'Pickup'], courier: ['Курʼєр', 'Courier'] };
  const pair = labels[value];
  return pair ? pair[ua ? 0 : 1] : value;
}

function paymentLabel(value: string, ua: boolean): string {
  const labels: Record<string, [string, string]> = { manager: ['Після підтвердження менеджером', 'After manager confirmation'], online: ['Онлайн', 'Online'] };
  const pair = labels[value];
  return pair ? pair[ua ? 0 : 1] : value;
}
