/**
 * Resolves an `ImageRef` to something `astro:assets` can optimise.
 *
 *  - CMS images are absolute URLs → passed through as remote images
 *    (the host is allow-listed in astro.config via PAYLOAD_URL).
 *  - Seed images are keys relative to `src/assets/` → resolved through
 *    `import.meta.glob`, so they get hashed, resized and converted like any
 *    other local asset.
 */
import type { ImageMetadata } from 'astro';
import type { ImageRef } from './cms/types';

const local = import.meta.glob<ImageMetadata>('/src/assets/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

/** A local asset (ImageMetadata) or an absolute URL that astro:assets fetches and optimises at build time. */
export type ImageSource = ImageMetadata | string;

export function resolveImage(ref: ImageRef): ImageSource {
  if (/^https?:\/\//.test(ref.src)) return ref.src;
  const key = `/src/assets/${ref.src.replace(/^\/?src\/assets\//, '').replace(/^\//, '')}`;
  const meta = local[key];
  if (!meta) {
    throw new Error(`[images] Unknown local image "${ref.src}". Expected a file under src/assets/.`);
  }
  return meta;
}

/**
 * Options for `getImage()` at a given output width. Remote sources need their
 * intrinsic size passed explicitly; local ones carry it in the metadata.
 */
export function imageOptions(ref: ImageRef, width: number, height?: number) {
  const src = resolveImage(ref);
  const h = height ?? Math.round((width * ref.height) / ref.width);
  return { src, width, height: h };
}

/** Absolute URL for Open Graph / JSON-LD. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = site?.href ?? 'https://babaloocoffeeclub.com/';
  return new URL(path, base).href;
}
