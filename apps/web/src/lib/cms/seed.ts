/**
 * Local content source. Used when `PAYLOAD_URL` is not configured (previews,
 * local development, first static deploy). The JSON files mirror the shape of
 * the normalised types, so the seed can also be pushed into Payload
 * (`apps/cms/src/seed`).
 */
import type { Homepage, MenuData, SEODefaults, SiteContent, SiteSettings } from './types';

import site from '@/content/seed/site.json';
import seo from '@/content/seed/seo.json';
import home from '@/content/seed/home.json';
import menu from '@/content/seed/menu.json';
import pages from '@/content/seed/pages.json';
import { deriveFromPages } from './derive';

type RawItem = Partial<MenuData['items'][number]> & { id: string; name: string; slug: string; category: string; order: number };
type RawCategory = Partial<MenuData['categories'][number]> & { id: string; name: string; slug: string; order: number };

function normaliseMenu(raw: { currency: string; categories: RawCategory[]; items: RawItem[] }): MenuData {
  return {
    currency: raw.currency,
    categories: raw.categories.map((c) => ({
      ...c,
      active: c.active ?? true,
    })) as MenuData['categories'],
    items: raw.items.map((i) => ({
      ...i,
      variants: i.variants ?? [],
      tags: i.tags ?? [],
      featured: i.featured ?? false,
      available: i.available ?? true,
    })) as MenuData['items'],
  };
}

export function loadSeed(): SiteContent {
  const homepage = home as unknown as Homepage;
  const galleryPage = pages.galleryPage as unknown as SiteContent['galleryPage'];
  return {
    settings: site as SiteSettings,
    seoDefaults: seo as SEODefaults,
    homepage,
    menuPage: pages.menuPage as SiteContent['menuPage'],
    aboutPage: pages.aboutPage as unknown as SiteContent['aboutPage'],
    contactPage: pages.contactPage as SiteContent['contactPage'],
    joinPage: pages.joinPage as SiteContent['joinPage'],
    galleryPage,
    menu: normaliseMenu(menu as never),
    ...deriveFromPages(homepage, galleryPage),
  };
}
