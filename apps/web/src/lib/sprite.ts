/**
 * Brand vector sprite.
 *
 * The hand-drawn dogs and icons from the PDF are large path sets (the poodle
 * alone is ~65 KB). Inlining them every time they repeat (marquees, footer,
 * nav) bloated pages to hundreds of KB, so they are served once as an external
 * SVG sprite with a content hash in the filename (cached for a year) and
 * referenced with <use>. `currentColor` still inherits through <use>.
 */
import poodle from '@/assets/brand/dog-poodle.svg?raw';
import basenji from '@/assets/brand/dog-basenji.svg?raw';
import club from '@/assets/brand/wordmark-club.svg?raw';
import logo from '@/assets/brand/logo-wordmark.svg?raw';
import chihuahua from '@/assets/brand/icon-chihuahua.svg?raw';
import beans from '@/assets/brand/icon-beans.svg?raw';
import chair from '@/assets/brand/icon-chair.svg?raw';
import dachshund from '@/assets/brand/icon-dachshund.svg?raw';
import cup from '@/assets/brand/icon-cup.svg?raw';
import cake from '@/assets/brand/icon-cake.svg?raw';
import bulldog from '@/assets/brand/icon-bulldog.svg?raw';
import croissant from '@/assets/brand/icon-croissant.svg?raw';
import icedCoffee from '@/assets/brand/icon-iced-coffee.svg?raw';

const sources = {
  'dog-poodle': poodle,
  'dog-basenji': basenji,
  'wordmark-club': club,
  'logo-wordmark': logo,
  'icon-chihuahua': chihuahua,
  'icon-beans': beans,
  'icon-chair': chair,
  'icon-dachshund': dachshund,
  'icon-cup': cup,
  'icon-cake': cake,
  'icon-bulldog': bulldog,
  'icon-croissant': croissant,
  'icon-iced-coffee': icedCoffee,
} as const;

export type SpriteId = keyof typeof sources;

/** The nine strip icons, in the order they appear in the PDF. */
export const stripIcons: SpriteId[] = [
  'icon-chihuahua',
  'icon-beans',
  'icon-chair',
  'icon-dachshund',
  'icon-cup',
  'icon-cake',
  'icon-bulldog',
  'icon-croissant',
  'icon-iced-coffee',
];

function parse(id: string, svg: string): { symbol: string; viewBox: string } {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 100 100';
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return { symbol: `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`, viewBox };
}

const parsed = Object.entries(sources).map(([id, svg]) => [id, parse(id, svg)] as const);

/** id → viewBox, used to size the <svg> that references the symbol. */
export const viewBoxes: Record<SpriteId, string> = Object.fromEntries(parsed.map(([id, p]) => [id, p.viewBox])) as Record<SpriteId, string>;

export const spriteSvg = `<svg xmlns="http://www.w3.org/2000/svg">${parsed.map(([, p]) => p.symbol).join('')}</svg>`;

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export const spriteHash = hash(spriteSvg);
export const spriteUrl = `/sprite-${spriteHash}.svg`;
