'use client';

import type { StickerType, StickerValue } from '@/lib/qr/payloads';
import type { DesignColors, StickerShape, TemplateKind } from './catalog';

export type ProductType = 'sticker' | 'vinyl' | 'transparent' | 'sign' | 'stand' | 'poster' | 'business_card' | 'qr_nfc';
export type StickerSize = 'S' | 'M' | 'L';

/** Одна созданная позиция в корзине заказа. */
export interface CartItem {
  id: string;
  key: string;
  payloadType: StickerType;
  value: StickerValue;
  label: string;
  subtitle?: string;
  icon: string;
  shape: StickerShape;
  template: TemplateKind;
  colors: DesignColors;
  productType: ProductType;
  size: StickerSize;
  quantity: number;
}

const STORAGE_KEY = 'qr-helper-cart';
const EVENT = 'qr-helper-cart-change';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CartItem>[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      productType: item.productType ?? 'sticker',
      size: item.size ?? 'M',
      quantity: Math.max(1, Number(item.quantity ?? 1)),
    })) as CartItem[];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(item: Omit<CartItem, 'id'>): void {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  save([...getCart(), { ...item, id }]);
}

export function removeFromCart(id: string): void {
  save(getCart().filter((i) => i.id !== id));
}

export function clearCart(): void {
  save([]);
}

export function subscribeCart(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}
