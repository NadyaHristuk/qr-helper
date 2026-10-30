export type OrderItem = {
  type?: string;
  label?: string;
  subtitle?: string;
  icon?: string;
  shape?: string;
  template?: string;
  productType?: string;
  size?: string;
  quantity?: number;
};

export function parseOrderItems(raw: string): OrderItem[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object' && !Array.isArray(item)).map((item) => ({
      ...Object.fromEntries(['type', 'label', 'subtitle', 'icon', 'shape', 'template', 'productType', 'size'].filter((key) => typeof item[key] === 'string').map((key) => [key, item[key]])),
      productType: typeof item.productType === 'string' ? item.productType : 'sticker',
      size: typeof item.size === 'string' ? item.size : 'M',
      quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1,
    })) : [];
  } catch {
    return [];
  }
}

