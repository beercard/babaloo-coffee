/**
 * Payload CMS content source (build-time only).
 *
 * Fetches the REST API and maps documents to the normalised types in
 * `./types`. Field names in `apps/cms` intentionally mirror these types, so
 * the mapping is thin: it mostly resolves media relations into `ImageRef`
 * objects with absolute URLs and drops inactive documents.
 */
import type {
  AboutPage,
  ContactPage,
  Gallery,
  GalleryPage,
  HomeSection,
  Homepage,
  ImageRef,
  JoinPage,
  Link,
  Location,
  MenuData,
  MenuPage,
  SEODefaults,
  SEOMeta,
  SiteContent,
  SiteSettings,
  Testimonial,
} from './types';

type Json = Record<string, unknown>;

const BASE = (import.meta.env.PAYLOAD_URL ?? '').replace(/\/$/, '');
const API_KEY = import.meta.env.PAYLOAD_API_KEY;

async function get<T = Json>(path: string): Promise<T> {
  const url = `${BASE}/api/${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { Authorization: `users API-Key ${API_KEY}` } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`[cms] ${res.status} ${res.statusText} for ${url}`);
  }
  return (await res.json()) as T;
}

async function getAll<T = Json>(collection: string, query = ''): Promise<T[]> {
  const data = await get<{ docs: T[] }>(`${collection}?limit=1000&depth=2&sort=order${query ? `&${query}` : ''}`);
  return data.docs;
}

/* ---------- mappers ---------- */

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() !== '' ? v : undefined;
}
function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function bool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}
function relId(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object' && 'id' in (v as Json)) return String((v as Json).id);
  return undefined;
}

export function image(v: unknown, altOverride?: string): ImageRef | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const doc = v as Json;
  const url = str(doc.url);
  const width = num(doc.width);
  const height = num(doc.height);
  if (!url || !width || !height) return undefined;
  return {
    src: url.startsWith('http') ? url : `${BASE}${url}`,
    alt: altOverride || str(doc.alt) || '',
    width,
    height,
    caption: str(doc.caption),
  };
}

function link(v: unknown): Link | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const l = v as Json;
  const label = str(l.label);
  const href = str(l.href) ?? str(l.url);
  if (!label || !href) return undefined;
  return { label, href, external: bool(l.external, undefined as unknown as boolean) };
}

function links(v: unknown): Link[] {
  return Array.isArray(v) ? (v.map(link).filter(Boolean) as Link[]) : [];
}

function seo(v: unknown): SEOMeta {
  const s = (v ?? {}) as Json;
  return {
    title: str(s.title),
    description: str(s.description),
    canonical: str(s.canonical),
    ogTitle: str(s.ogTitle),
    ogDescription: str(s.ogDescription),
    ogImage: image(s.ogImage),
    twitterCard: (str(s.twitterCard) as SEOMeta['twitterCard']) ?? undefined,
    robots: str(s.robots),
  };
}

function address(v: unknown): SiteSettings['address'] {
  if (!v || typeof v !== 'object') return undefined;
  const a = v as Json;
  const street = str(a.street);
  const city = str(a.city);
  if (!city) return undefined;
  return {
    street: street ?? '',
    suite: str(a.suite),
    city,
    region: str(a.region) ?? '',
    postalCode: str(a.postalCode),
    country: str(a.country) ?? 'US',
  };
}

function settings(doc: Json): SiteSettings {
  return {
    name: str(doc.name) ?? 'Babaloo Coffee Club',
    legalName: str(doc.legalName),
    tagline: str(doc.tagline),
    logo: image(doc.logo),
    phone: str(doc.phone),
    email: str(doc.email),
    address: address(doc.address),
    social: Array.isArray(doc.social)
      ? (doc.social as Json[])
          .filter((s) => str(s.url))
          .map((s) => ({
            platform: (str(s.platform) ?? 'other') as SiteSettings['social'][number]['platform'],
            label: str(s.label) ?? str(s.platform) ?? 'Social',
            url: str(s.url) as string,
          }))
      : [],
    orderUrl: str(doc.orderUrl),
    mapUrl: str(doc.mapUrl),
    priceRange: str(doc.priceRange),
    nav: links(doc.nav),
    footerNav: links(doc.footerNav),
    primaryCta: link(doc.primaryCta),
    secondaryCta: link(doc.secondaryCta),
    copyright: str(doc.copyright),
  };
}

function seoDefaults(doc: Json): SEODefaults {
  return {
    titleTemplate: str(doc.titleTemplate) ?? '%s | Babaloo Coffee Club',
    defaultTitle: str(doc.defaultTitle) ?? 'Babaloo Coffee Club',
    description: str(doc.description) ?? '',
    ogImage: image(doc.ogImage),
    twitterHandle: str(doc.twitterHandle),
    robots: str(doc.robots) ?? 'index, follow',
    locale: str(doc.locale) ?? 'en_US',
  };
}

function section(block: Json, index: number): HomeSection | undefined {
  const base = {
    id: str(block.id) ?? `${str(block.blockType)}-${index}`,
    enabled: bool(block.enabled, true),
    anchor: str(block.anchor),
  };
  switch (block.blockType) {
    case 'hero':
      return {
        ...base,
        type: 'hero',
        interval: num(block.interval) ?? 5,
        slides: Array.isArray(block.slides)
          ? (block.slides as Json[])
              .map((s) => {
                const img = image(s.image);
                return img
                  ? {
                      image: img,
                      imageMobile: image(s.imageMobile),
                      title: str(s.title),
                      subtitle: str(s.subtitle),
                      text: str(s.text),
                      cta: link(s.cta),
                    }
                  : undefined;
              })
              .filter((s): s is NonNullable<typeof s> => Boolean(s))
          : [],
      };
    case 'iconStrip':
      return { ...base, type: 'iconStrip', speed: num(block.speed) ?? 40 };
    case 'navRow':
      return { ...base, type: 'navRow' };
    case 'clubStrip':
      return { ...base, type: 'clubStrip' };
    case 'intro':
      return { ...base, type: 'intro', title: str(block.title), text: str(block.text) ?? '', cta: link(block.cta) };
    case 'locations':
      return { ...base, type: 'locations', title: str(block.title), text: str(block.text) };
    case 'featuredMenu':
      return {
        ...base,
        type: 'featuredMenu',
        title: str(block.title),
        text: str(block.text),
        cta: link(block.cta),
        limit: num(block.limit) ?? 4,
      };
    case 'gallery':
      return {
        ...base,
        type: 'gallery',
        title: str(block.title),
        gallery: (typeof block.gallery === 'object' && block.gallery ? str((block.gallery as Json).slug) : str(block.gallery)) ?? 'main',
        limit: num(block.limit) ?? 6,
        cta: link(block.cta),
      };
    case 'testimonials':
      return { ...base, type: 'testimonials', title: str(block.title) };
    case 'cta': {
      const cta = link(block.cta);
      if (!cta) return undefined;
      return {
        ...base,
        type: 'cta',
        title: str(block.title) ?? '',
        text: str(block.text),
        cta,
        image: image(block.image),
        imageMobile: image(block.imageMobile),
        background: (str(block.background) as 'cream' | 'concrete' | 'sage' | 'bark') ?? 'cream',
      };
    }
    case 'richText':
      return {
        ...base,
        type: 'richText',
        title: str(block.title),
        html: str(block.html) ?? '',
        image: image(block.image),
        imageMobile: image(block.imageMobile),
        imagePosition: (str(block.imagePosition) as 'left' | 'right') ?? 'left',
        background: (str(block.background) as 'cream' | 'concrete' | 'sage') ?? 'cream',
      };
    default:
      return undefined;
  }
}

function homepage(doc: Json): Homepage {
  const raw = Array.isArray(doc.sections) ? (doc.sections as Json[]) : [];
  return {
    sections: raw.map(section).filter((s): s is HomeSection => Boolean(s)),
    seo: seo(doc.seo),
  };
}

function location(doc: Json): Location {
  return {
    id: String(doc.id),
    slug: str(doc.slug) ?? String(doc.id),
    name: str(doc.name) ?? '',
    scriptName: str(doc.scriptName),
    status: (str(doc.status) as Location['status']) ?? 'open',
    address: address(doc.address),
    phone: str(doc.phone),
    email: str(doc.email),
    hoursDisplay: Array.isArray(doc.hoursDisplay)
      ? (doc.hoursDisplay as Json[]).map((h) => ({ days: str(h.days) ?? '', hours: str(h.hours) ?? '' }))
      : [],
    hoursSpec: Array.isArray(doc.hoursSpec)
      ? (doc.hoursSpec as Json[]).map((h) => ({
          dayOfWeek: Array.isArray(h.dayOfWeek) ? (h.dayOfWeek as string[]) : [],
          opens: str(h.opens) ?? '',
          closes: str(h.closes) ?? '',
        }))
      : [],
    mapUrl: str(doc.mapUrl),
    geo:
      typeof doc.geo === 'object' && doc.geo && num((doc.geo as Json).lat) !== undefined
        ? { lat: num((doc.geo as Json).lat) as number, lng: num((doc.geo as Json).lng) as number }
        : undefined,
    image: image(doc.image),
    orderUrl: str(doc.orderUrl),
    note: str(doc.note),
    order: num(doc.order) ?? 0,
  };
}

function menu(categories: Json[], items: Json[]): MenuData {
  return {
    currency: 'USD',
    categories: categories.map((c) => ({
      id: String(c.id),
      name: str(c.name) ?? '',
      slug: str(c.slug) ?? String(c.id),
      description: str(c.description),
      parent: relId(c.parent),
      image: image(c.image),
      order: num(c.order) ?? 0,
      active: bool(c.active, true),
    })),
    items: items.map((i) => ({
      id: String(i.id),
      name: str(i.name) ?? '',
      slug: str(i.slug) ?? String(i.id),
      description: str(i.description),
      price: num(i.price),
      priceLabel: str(i.priceLabel),
      variants: Array.isArray(i.variants)
        ? (i.variants as Json[]).map((v) => ({ name: str(v.name) ?? '', price: num(v.price) ?? 0 }))
        : [],
      image: image(i.image),
      category: relId(i.category) ?? '',
      tags: Array.isArray(i.tags) ? (i.tags as string[]) : [],
      featured: bool(i.featured),
      available: bool(i.available, true),
      order: num(i.order) ?? 0,
    })),
  };
}

function gallery(doc: Json): Gallery {
  return {
    id: String(doc.id),
    name: str(doc.name) ?? '',
    slug: str(doc.slug) ?? String(doc.id),
    description: str(doc.description),
    images: Array.isArray(doc.images)
      ? (doc.images as Json[])
          .map((g, i) => {
            const img = image(g.image, str(g.alt));
            return img ? { image: img, caption: str(g.caption), order: num(g.order) ?? i + 1 } : undefined;
          })
          .filter((g): g is NonNullable<typeof g> => Boolean(g))
      : [],
  };
}

function testimonial(doc: Json): Testimonial {
  return {
    id: String(doc.id),
    quote: str(doc.quote) ?? '',
    author: str(doc.author) ?? '',
    role: str(doc.role),
    rating: num(doc.rating),
    order: num(doc.order) ?? 0,
  };
}

/* ---------- public loader ---------- */

export async function loadPayload(): Promise<SiteContent> {
  const [
    settingsDoc,
    seoDoc,
    homeDoc,
    menuDoc,
    aboutDoc,
    contactDoc,
    joinDoc,
    galleryDoc,
    categories,
    items,
    locations,
    galleries,
    testimonials,
  ] = await Promise.all([
    get('globals/site-settings?depth=2'),
    get('globals/seo-defaults?depth=2'),
    get('globals/homepage?depth=3'),
    get('globals/menu-page?depth=2'),
    get('globals/about-page?depth=2'),
    get('globals/contact-page?depth=2'),
    get('globals/join-page?depth=2'),
    get('globals/gallery-page?depth=2'),
    getAll('menu-categories', 'where[active][equals]=true'),
    getAll('menu-items', 'where[available][equals]=true'),
    getAll('locations', 'where[status][not_equals]=closed'),
    getAll('galleries'),
    getAll('testimonials', 'where[active][equals]=true'),
  ]);

  const menuPage: MenuPage = {
    intro: {
      title: str((menuDoc.intro as Json | undefined)?.title) ?? 'homemade creations',
      text: str((menuDoc.intro as Json | undefined)?.text),
    },
    showPrices: bool(menuDoc.showPrices, true),
    seo: seo(menuDoc.seo),
  };
  const aboutPage: AboutPage = {
    title: str(aboutDoc.title) ?? 'About',
    frames: Array.isArray(aboutDoc.frames)
      ? ((aboutDoc.frames as Json[]).map((f) => image(f.image ?? f)).filter(Boolean) as ImageRef[])
      : [],
    text: str(aboutDoc.text) ?? '',
    showTeamSection: bool(aboutDoc.showTeamSection, true),
    teamImage: image(aboutDoc.teamImage),
    showContactSection: bool(aboutDoc.showContactSection, true),
    seo: seo(aboutDoc.seo),
  };
  const contactPage: ContactPage = { title: str(contactDoc.title) ?? 'Contact us', text: str(contactDoc.text), seo: seo(contactDoc.seo) };
  const joinPage: JoinPage = {
    title: str(joinDoc.title) ?? 'Join our team',
    text: str(joinDoc.text),
    positions: Array.isArray(joinDoc.positions) ? (joinDoc.positions as Json[]).map((p) => str(p.label) ?? '').filter(Boolean) : [],
    experienceLevels: Array.isArray(joinDoc.experienceLevels)
      ? (joinDoc.experienceLevels as Json[]).map((p) => str(p.label) ?? '').filter(Boolean)
      : [],
    image: image(joinDoc.image),
    seo: seo(joinDoc.seo),
  };
  const galleryPage: GalleryPage = {
    title: str(galleryDoc.title) ?? 'Gallery',
    text: str(galleryDoc.text),
    gallery: (typeof galleryDoc.gallery === 'object' && galleryDoc.gallery ? str((galleryDoc.gallery as Json).slug) : str(galleryDoc.gallery)) ?? 'main',
    seo: seo(galleryDoc.seo),
  };

  return {
    settings: settings(settingsDoc),
    seoDefaults: seoDefaults(seoDoc),
    homepage: homepage(homeDoc),
    menuPage,
    aboutPage,
    contactPage,
    joinPage,
    galleryPage,
    menu: menu(categories, items),
    locations: locations.map(location),
    galleries: galleries.map(gallery),
    testimonials: testimonials.map(testimonial),
  };
}
