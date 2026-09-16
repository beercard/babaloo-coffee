/**
 * Local content source. Used when `PAYLOAD_URL` is not configured (previews,
 * local development, first static deploy). The JSON files mirror the shape of
 * the normalised types, so the seed can also be pushed into Payload
 * (`apps/cms/src/seed`). Fields added later get their defaults here.
 */
import type { AboutPage, ContactPage, HomeSection, Homepage, ImageRef, MenuData, MenuLabel, MenuPage, SEODefaults, SiteContent, SiteSettings } from './types';

import site from '@/content/seed/site.json';
import seo from '@/content/seed/seo.json';
import home from '@/content/seed/home.json';
import menu from '@/content/seed/menu.json';
import pages from '@/content/seed/pages.json';
import { deriveFromPages } from './derive';
import { DEFAULT_DESIGN, DEFAULT_FORMS, DEFAULT_EXPERIENCE, DEFAULT_POSITIONS } from './defaults';

type Json = Record<string, unknown>;
type RawItem = Partial<MenuData['items'][number]> & { id: string; name: string; slug: string; category: string; order: number; tags?: string[] };
type RawCategory = Partial<MenuData['categories'][number]> & { id: string; name: string; slug: string; order: number };

const LABEL_COLORS: Record<string, string> = { 'rea-farms': '#5d6b3d', 'south-end': '#8a4b2f', 'lake-norman': '#3f6273' };
const slugOf = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function label(tag: string): MenuLabel {
  const slug = slugOf(tag);
  return { name: tag, slug, kind: LABEL_COLORS[slug] ? 'location' : 'badge', color: LABEL_COLORS[slug], showBadge: true };
}

function normaliseMenu(raw: { currency: string; categories: RawCategory[]; items: RawItem[] }): MenuData {
  return {
    currency: raw.currency,
    categories: raw.categories.map((c) => ({
      ...c,
      active: c.active ?? true,
    })) as MenuData['categories'],
    items: raw.items.map(({ tags, ...i }) => ({
      ...i,
      variants: i.variants ?? [],
      labels: (tags ?? []).map(label),
      featured: i.featured ?? false,
      available: i.available ?? true,
    })) as MenuData['items'],
  };
}

/** Seed sections predate a few options: fill them in. */
function normaliseSections(raw: Json[]): HomeSection[] {
  return raw.map((s) => {
    switch (s.type) {
      case 'hero':
        return { ...s, height: s.height ?? 'tall' } as unknown as HomeSection;
      case 'iconStrip':
        return { ...s, icons: s.icons ?? [] } as unknown as HomeSection;
      case 'clubStrip':
        return { ...s, speed: s.speed ?? 40 } as unknown as HomeSection;
      case 'intro':
      case 'cta':
        return { ...s, align: s.align ?? 'center' } as unknown as HomeSection;
      case 'richText':
        return { ...s, align: s.align ?? 'left' } as unknown as HomeSection;
      default:
        return s as unknown as HomeSection;
    }
  });
}

export function loadSeed(): SiteContent {
  const homepage: Homepage = { ...(home as unknown as Homepage), sections: normaliseSections((home as unknown as { sections: Json[] }).sections) };
  const rawAbout = pages.aboutPage as unknown as Json & { frames: ImageRef[]; join: AboutPage['join'] };
  const aboutPage: AboutPage = {
    ...(rawAbout as unknown as AboutPage),
    frames: rawAbout.frames.map((image) => ({ images: [image] })),
    frameColumns: 3,
    framesAutoplay: false,
    textAlign: 'center',
    showClubStrip: true,
    sections: [],
  };
  const menuPage: MenuPage = {
    ...(pages.menuPage as unknown as MenuPage),
    intro: { ...(pages.menuPage.intro as MenuPage['intro']), align: 'center' },
    showLocationFilter: true,
    allLocationsLabel: 'All locations',
    sections: [],
  };
  const forms = structuredClone(DEFAULT_FORMS);
  const positions = rawAbout.join?.positions?.length ? rawAbout.join.positions : DEFAULT_POSITIONS;
  const experience = rawAbout.join?.experienceLevels?.length ? rawAbout.join.experienceLevels : DEFAULT_EXPERIENCE;
  forms.careers.fields = forms.careers.fields.map((f) => (f.name === 'position' ? { ...f, options: positions } : f.name === 'experience' ? { ...f, options: experience } : f));
  return {
    settings: { ...(site as unknown as SiteSettings), footerShowAddress: true, footerShowEmail: true },
    seoDefaults: seo as SEODefaults,
    homepage,
    menuPage,
    aboutPage,
    contactPage: { ...(pages.contactPage as unknown as ContactPage), sections: [] },
    pages: [],
    design: DEFAULT_DESIGN,
    forms,
    menu: normaliseMenu(menu as never),
    ...deriveFromPages(homepage),
  };
}
