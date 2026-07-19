/**
 * Цены заказа. Значения ЧЕРНОВЫЕ — в спецификации указаны только
 * «стандарт — цена» и «индивидуальный шаблон — цена +100 грн».
 * Точные цены и валюту согласовать с автором. Всё храним в копейках UAH.
 */

export type Template = 'standard' | 'individual';

/** Базовая цена набора наклеек (стандартный шаблон), копейки UAH. */
export const BASE_PRICE_KOP = 30000; // 300 грн — черновая цифра

/** Надбавка за индивидуальный шаблон (+100 грн из эскизов), копейки UAH. */
export const INDIVIDUAL_SURCHARGE_KOP = 10000; // +100 грн

/** Итоговая цена заказа по выбранному шаблону, в копейках. */
export function priceForTemplate(template: Template): number {
  return template === 'individual'
    ? BASE_PRICE_KOP + INDIVIDUAL_SURCHARGE_KOP
    : BASE_PRICE_KOP;
}
