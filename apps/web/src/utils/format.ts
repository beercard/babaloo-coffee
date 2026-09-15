import type { MenuItem } from '@/lib/cms/types';

const formatters = new Map<string, Intl.NumberFormat>();

/** "$5" for whole numbers, "$4.50" otherwise — the way the menu board reads. */
export function formatPrice(value: number, currency = 'USD'): string {
  const whole = Number.isInteger(value);
  const key = `${currency}:${whole ? 0 : 2}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    });
    formatters.set(key, f);
  }
  return f.format(value);
}

/** Price text for a menu item: explicit label wins, then numeric price, then variant range. */
export function itemPrice(item: MenuItem, currency = 'USD'): string | undefined {
  if (item.priceLabel) return item.priceLabel;
  if (typeof item.price === 'number') return formatPrice(item.price, currency);
  if (item.variants.length) {
    const prices = item.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatPrice(min, currency) : `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;
  }
  return undefined;
}

/** Splits editor text on blank lines into paragraphs; single line breaks become <br>. */
export function paragraphs(text: string): string[][] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((p) => p.length);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}
