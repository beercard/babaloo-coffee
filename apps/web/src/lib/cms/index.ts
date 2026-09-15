/**
 * Single entry point for content. Components import from here and never care
 * whether the data came from Payload or the local seed.
 *
 *   PAYLOAD_URL set   → fetch from Payload at build time
 *   PAYLOAD_URL empty → use src/content/seed/*.json
 *
 * The result is memoised for the whole build, so every page shares one fetch.
 */
import type { Gallery, Location, MenuCategory, MenuItem, SiteContent } from './types';
import { loadSeed } from './seed';

let cache: Promise<SiteContent> | undefined;

export function getContent(): Promise<SiteContent> {
  if (!cache) {
    cache = (async () => {
      if (import.meta.env.PAYLOAD_URL) {
        const { loadPayload } = await import('./payload');
        try {
          const content = await loadPayload();
          console.info(`[cms] content loaded from ${import.meta.env.PAYLOAD_URL}`);
          return content;
        } catch (err) {
          // A failed CMS fetch must fail the build loudly: publishing stale or
          // seed content by accident is worse than a red build.
          throw new Error(`[cms] Could not load content from Payload. ${(err as Error).message}`);
        }
      }
      console.info('[cms] PAYLOAD_URL not set — using local seed content');
      return loadSeed();
    })();
  }
  return cache;
}

/* ---------- Convenience selectors ---------- */

export interface MenuTree {
  category: MenuCategory;
  items: MenuItem[];
  children: MenuTree[];
}

const byOrder = <T extends { order: number; name?: string }>(a: T, b: T) =>
  a.order - b.order || (a.name ?? '').localeCompare(b.name ?? '');

/** Builds the nested Category → Subcategory → Items structure used by the menu page. */
export function buildMenuTree(categories: MenuCategory[], items: MenuItem[]): MenuTree[] {
  const active = categories.filter((c) => c.active);
  const available = items.filter((i) => i.available).sort(byOrder);
  const build = (parent?: string): MenuTree[] =>
    active
      .filter((c) => (c.parent ?? undefined) === parent)
      .sort(byOrder)
      .map((category) => ({
        category,
        items: available.filter((i) => i.category === category.id),
        children: build(category.id),
      }))
      // Hide empty branches so an editor can prepare categories without showing them.
      .filter((node) => node.items.length > 0 || node.children.length > 0);
  return build(undefined);
}

export function featuredItems(items: MenuItem[], limit = 4): MenuItem[] {
  return items.filter((i) => i.available && i.featured && i.image).sort(byOrder).slice(0, limit);
}

export function findGallery(galleries: Gallery[], slug: string): Gallery | undefined {
  return galleries.find((g) => g.slug === slug);
}

export function sortedLocations(locations: Location[]): Location[] {
  return [...locations].sort(byOrder);
}

export type { SiteContent };
