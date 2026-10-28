/**
 * Demo price used only to keep the order flow end-to-end before the
 * business owner approves the concept and real pricing rules.
 * Values are stored in kopecks (UAH).
 */

export type Template = 'standard' | 'individual';

/** Fixed demo price: 1 UAH. */
export const DEMO_PRICE_KOP = 100;

/**
 * Keep the template argument for the existing API contract, but do not
 * imply that different commercial prices are already defined.
 */
export function priceForTemplate(_template: Template): number {
  return DEMO_PRICE_KOP;
}
