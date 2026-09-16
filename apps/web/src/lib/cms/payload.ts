/**
 * Payload CMS content source (build-time only).
 *
 * Fetches the REST API and maps documents to the normalised types in
 * `./types`. Field names in `apps/cms` intentionally mirror these types, so
 * the mapping is thin: it mostly resolves media relations into `ImageRef`
 * objects with absolute URLs and drops inactive documents.
 */
import { deriveFromPages } from './derive';
import { DEFAULT_DESIGN, withFormDefaults } from './defaults';
import type {
  AboutPage,
  Align,
  ContactPage,
  CustomPage,
  Design,
  FormConfig,
  FormFieldConfig,
  FormsConfig,
  FrameItem,
  MenuLabel,
  GalleryImage,
  HomeSection,
  Homepage,
  ImageRef,
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
/** Lets the preview build read unpublished drafts (must match PREVIEW_SECRET on the CMS). */
const PREVIEW_SECRET = import.meta.env.PAYLOAD_PREVIEW_SECRET;
/** Preview build: latest drafts instead of the published content. */
export const DRAFTS = import.meta.env.PAYLOAD_DRAFTS === '1';

async function get<T = Json>(path: string): Promise<T> {
  const url = `${BASE}/api/${path}${DRAFTS ? `${path.includes('?') ? '&' : '?'}draft=true` : ''}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { Authorization: `users API-Key ${API_KEY}` } : {}),
      ...(DRAFTS && PREVIEW_SECRET ? { 'x-preview-secret': PREVIEW_SECRET } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`[cms] ${res.status} ${res.statusText} for ${url}`);
  }
  return (await res.json()) as T;
}

/**
 * All documents of a collection. `filter` is a single field condition, e.g. ['active', 'equals', 'true'].
 * The live build only takes published documents (a never-published draft stays out; documents from
 * before drafts existed have no status and count as published).
 */
async function getAll<T = Json>(collection: string, filter?: [string, string, string], sort = 'order'): Promise<T[]> {
  const q: string[] = [];
  let i = 0;
  if (filter) q.push(`where[and][${i++}][${filter[0]}][${filter[1]}]=${encodeURIComponent(filter[2])}`);
  if (!DRAFTS) q.push(`where[and][${i}][or][0][_status][equals]=published`, `where[and][${i}][or][1][_status][exists]=false`);
  const data = await get<{ docs: T[] }>(`${collection}?limit=1000&depth=2&sort=${sort}${q.length ? `&${q.join('&')}` : ''}`);
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
    ...(num(doc.focalX) !== undefined && num(doc.focalY) !== undefined ? { focal: { x: num(doc.focalX) as number, y: num(doc.focalY) as number } } : {}),
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
    footerShowAddress: bool(doc.footerShowAddress, true),
    footerShowEmail: bool(doc.footerShowEmail, true),
    footerNote: str(doc.footerNote),
  };
}

const align = (v: unknown, fallback: Align): Align => (v === 'left' || v === 'center' || v === 'right' ? v : fallback);
const pct = (v: unknown, fallback = 100) => num(v) ?? fallback;
const color = (v: unknown) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined);

function design(doc: Json): Design {
  const c = (doc.colors ?? {}) as Json;
  const ty = (doc.type ?? {}) as Json;
  const l = (doc.layout ?? {}) as Json;
  const h = (doc.header ?? {}) as Json;
  const f = (doc.footer ?? {}) as Json;
  const d = DEFAULT_DESIGN;
  const colors: Design['colors'] = {};
  for (const key of ['ink', 'cream', 'bark', 'creamBright', 'sage', 'concrete', 'wood', 'focus'] as const) {
    const v = color(c[key]);
    if (v) colors[key] = v;
  }
  return {
    colors,
    type: {
      bodyFont: ty.bodyFont === 'poppins' ? 'poppins' : 'lato',
      uiFont: ty.uiFont === 'lato' ? 'lato' : 'poppins',
      scriptFont: ty.scriptFont === 'delafield' ? 'delafield' : 'jimmy',
      textScale: pct(ty.textScale),
      titleScale: pct(ty.titleScale),
      scriptScale: pct(ty.scriptScale),
      menuScale: pct(ty.menuScale),
      navScale: pct(ty.navScale),
    },
    layout: {
      sectionSpacing: pct(l.sectionSpacing),
      sideMargin: pct(l.sideMargin),
      contentWidth: num(l.contentWidth) ?? d.layout.contentWidth,
      titleAlign: align(l.titleAlign, 'center'),
      animations: bool(l.animations, true),
    },
    header: {
      size: h.size === 's' || h.size === 'l' ? h.size : 'm',
      logoScale: pct(h.logoScale),
      sticky: bool(h.sticky, true),
      logo: image(h.logo),
      wood: image(h.wood),
      showCurtain: bool(h.showCurtain, true),
      curtain: image(h.curtain),
      menuLogo: image(h.menuLogo),
    },
    footer: {
      background: f.background === 'color' ? 'color' : 'texture',
      color: color(f.color),
      textColor: color(f.textColor),
      logo: image(f.logo),
      showDogs: bool(f.showDogs, true),
      texture: image(f.texture),
    },
  };
}

function formConfig(name: 'contact' | 'careers', v: unknown): FormConfig {
  const g = (v ?? {}) as Json;
  const fields: FormFieldConfig[] = Array.isArray(g.fields)
    ? (g.fields as Json[])
        .map((x) => {
          const type = (str(x.type) ?? 'text') as FormFieldConfig['type'];
          return {
            name: type === 'file' ? 'resume' : (str(x.name) ?? ''),
            label: str(x.label) ?? '',
            type,
            required: bool(x.required),
            width: (x.width === 'full' || type === 'textarea' ? 'full' : 'half') as FormFieldConfig['width'],
            options: Array.isArray(x.options) ? (x.options as Json[]).map((o) => str(o.label) ?? '').filter(Boolean) : [],
          };
        })
        .filter((x) => x.name && x.label)
    : [];
  return withFormDefaults(name, { fields, submitLabel: str(g.submitLabel), successMessage: str(g.successMessage), subject: str(g.emailSubject) });
}

function forms(doc: Json): FormsConfig {
  return { contact: formConfig('contact', doc.contact), careers: formConfig('careers', doc.careers) };
}

function images(v: unknown): ImageRef[] {
  return Array.isArray(v) ? (v.map((x) => image(x)).filter(Boolean) as ImageRef[]) : [];
}

function frameItems(v: unknown): FrameItem[] {
  if (!Array.isArray(v)) return [];
  return (v as Json[])
    .map((f) => ({ images: [image(f.image ?? f), ...images(f.more)].filter(Boolean) as ImageRef[], label: str(f.label) }))
    .filter((f) => f.images.length > 0);
}

function sections(v: unknown): HomeSection[] {
  const raw = Array.isArray(v) ? (v as Json[]) : [];
  return raw.map(section).filter((s): s is HomeSection => Boolean(s));
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
        height: block.height === 'medium' || block.height === 'short' ? block.height : 'tall',
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
      return { ...base, type: 'iconStrip', speed: num(block.speed) ?? 40, icons: Array.isArray(block.icons) ? images((block.icons as Json[]).map((x) => x.image)) : [] };
    case 'navRow':
      return { ...base, type: 'navRow' };
    case 'clubStrip':
      return { ...base, type: 'clubStrip', speed: num(block.speed) ?? 40 };
    case 'intro':
      return { ...base, type: 'intro', title: str(block.title), text: str(block.text) ?? '', cta: link(block.cta), align: align(block.align, 'center') };
    case 'locations':
      return {
        ...base,
        type: 'locations',
        title: str(block.title),
        text: str(block.text),
        items: Array.isArray(block.items) ? (block.items as Json[]).map((l, i) => location({ ...l, id: str(l.id) ?? `location-${i + 1}`, order: i + 1 })) : [],
      };
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
      return { ...base, type: 'gallery', title: str(block.title), images: galleryImages(block.images), limit: num(block.limit) ?? 12, cta: link(block.cta) };
    case 'testimonials':
      return {
        ...base,
        type: 'testimonials',
        title: str(block.title),
        items: Array.isArray(block.items) ? (block.items as Json[]).map((x, i) => testimonial({ ...x, id: str(x.id) ?? `t-${i}`, order: i + 1 })) : [],
      };
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
        align: align(block.align, 'center'),
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
        align: align(block.align, 'left'),
      };
    case 'frames': {
      const items = frameItems(block.items);
      if (!items.length) return undefined;
      const cols = Number(block.columns);
      return { ...base, type: 'frames', title: str(block.title), items, columns: (cols === 2 || cols === 4 ? cols : 3) as 2 | 3 | 4, autoplay: bool(block.autoplay) };
    }
    case 'form':
      return {
        ...base,
        type: 'form',
        form: block.form === 'careers' ? 'careers' : 'contact',
        title: str(block.title),
        text: str(block.text),
        image: image(block.image),
        background: (str(block.background) as 'cream' | 'concrete' | 'sage') ?? 'cream',
      };
    case 'spacer':
      return {
        ...base,
        type: 'spacer',
        size: block.size === 's' || block.size === 'l' ? block.size : 'm',
        line: bool(block.line),
        background: (str(block.background) as 'cream' | 'concrete' | 'sage' | 'bark') ?? 'cream',
      };
    default:
      return undefined;
  }
}

function homepage(doc: Json): Homepage {
  return { sections: sections(doc.sections), seo: seo(doc.seo) };
}

function page(doc: Json): CustomPage | undefined {
  const slug = str(doc.slug);
  const title = str(doc.title);
  if (!slug || !title) return undefined;
  return {
    id: String(doc.id),
    title,
    slug,
    showTitle: bool(doc.showTitle, true),
    background: doc.background === 'concrete' ? 'concrete' : 'cream',
    intro: str(doc.intro),
    sections: sections(doc.sections),
    seo: seo(doc.seo),
  };
}

const slugOf = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const LEGACY_LOCATIONS = ['rea farms', 'south end', 'lake norman'];

function labels(item: Json): MenuLabel[] {
  if (Array.isArray(item.labels) && item.labels.length) {
    return (item.labels as unknown[])
      .filter((l): l is Json => Boolean(l) && typeof l === 'object')
      .filter((l) => DRAFTS || l._status !== 'draft')
      .map((l) => ({
        name: str(l.name) ?? '',
        slug: str(l.slug) ?? slugOf(str(l.name) ?? ''),
        kind: (l.kind === 'location' ? 'location' : 'badge') as MenuLabel['kind'],
        color: color(l.color),
        textColor: color(l.textColor),
        showBadge: bool(l.showBadge, true),
        order: num(l.order) ?? 0,
      }))
      .filter((l) => l.name)
      .sort((a, b) => a.order - b.order);
  }
  // Before labels existed: fixed tags.
  return (Array.isArray(item.tags) ? (item.tags as string[]) : []).map((t) => ({
    name: t,
    slug: slugOf(t),
    kind: LEGACY_LOCATIONS.includes(t.toLowerCase()) ? 'location' : 'badge',
    showBadge: true,
  }));
}

function location(doc: Json): Location {
  return {
    id: String(doc.id),
    slug: str(doc.slug) ?? (str(doc.name) ?? String(doc.id)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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
      displayName: str(c.displayName),
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
      labels: labels(i),
      featured: bool(i.featured),
      available: bool(i.available, true),
      order: num(i.order) ?? 0,
    })),
  };
}

function galleryImages(v: unknown): GalleryImage[] {
  return Array.isArray(v)
    ? (v as Json[])
        .map((g, i) => {
          const img = image(g.image, str(g.alt));
          return img ? { image: img, caption: str(g.caption), order: i + 1 } : undefined;
        })
        .filter((g): g is NonNullable<typeof g> => Boolean(g))
    : [];
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
    categories,
    items,
  ] = await Promise.all([
    get('globals/site-settings?depth=2'),
    get('globals/seo-defaults?depth=2'),
    get('globals/homepage?depth=3'),
    get('globals/menu-page?depth=2'),
    get('globals/about-page?depth=2'),
    get('globals/contact-page?depth=2'),
    getAll('menu-categories', ['active', 'equals', 'true']),
    getAll('menu-items', ['available', 'equals', 'true']),
  ]);
  // Settings added later: tolerate a CMS that does not have them yet.
  const [designDoc, formsDoc, pageDocs] = await Promise.all([
    get('globals/design?depth=1').catch(() => ({}) as Json),
    get('globals/forms?depth=0').catch(() => ({}) as Json),
    getAll('pages', undefined, 'title').catch(() => [] as Json[]),
  ]);

  const menuPage: MenuPage = {
    intro: {
      title: str((menuDoc.intro as Json | undefined)?.title) ?? 'homemade creations',
      text: str((menuDoc.intro as Json | undefined)?.text),
      align: align((menuDoc.intro as Json | undefined)?.align, 'center'),
    },
    showPrices: bool(menuDoc.showPrices, true),
    showLocationFilter: bool(menuDoc.showLocationFilter, true),
    allLocationsLabel: str(menuDoc.allLocationsLabel) ?? 'All locations',
    sections: sections(menuDoc.sections),
    seo: seo(menuDoc.seo),
  };
  const formsConfig = forms(formsDoc);
  // Older CMS data: the careers dropdowns lived on the About page.
  const legacyList = (v: unknown) => (Array.isArray(v) ? (v as Json[]).map((p) => str(p.label) ?? '').filter(Boolean) : []);
  const legacyPositions = legacyList((aboutDoc.join as Json | undefined)?.positions);
  const legacyExperience = legacyList((aboutDoc.join as Json | undefined)?.experienceLevels);
  if (!Array.isArray((formsDoc.careers as Json | undefined)?.fields) || !((formsDoc.careers as Json).fields as unknown[]).length) {
    formsConfig.careers.fields = formsConfig.careers.fields.map((f) =>
      f.name === 'position' && legacyPositions.length ? { ...f, options: legacyPositions } : f.name === 'experience' && legacyExperience.length ? { ...f, options: legacyExperience } : f,
    );
  }
  const aboutPage: AboutPage = {
    title: str(aboutDoc.title) ?? 'About',
    frames: frameItems(aboutDoc.frames),
    frameColumns: (Number(aboutDoc.frameColumns) === 2 || Number(aboutDoc.frameColumns) === 4 ? Number(aboutDoc.frameColumns) : 3) as 2 | 3 | 4,
    framesAutoplay: bool(aboutDoc.framesAutoplay),
    text: str(aboutDoc.text) ?? '',
    textAlign: align(aboutDoc.textAlign, 'center'),
    showClubStrip: bool(aboutDoc.showClubStrip, true),
    sections: sections(aboutDoc.sections),
    showTeamSection: bool(aboutDoc.showTeamSection, true),
    teamImage: image(aboutDoc.teamImage),
    join: {
      title: str((aboutDoc.join as Json | undefined)?.title) ?? 'Join our team',
      text: str((aboutDoc.join as Json | undefined)?.text),
      positions: legacyPositions,
      experienceLevels: legacyExperience,
    },
    showContactSection: bool(aboutDoc.showContactSection, true),
    seo: seo(aboutDoc.seo),
  };
  const details = (contactDoc.details ?? {}) as Json;
  const contactPage: ContactPage = {
    title: str(contactDoc.title) ?? 'Contact us',
    text: str(contactDoc.text),
    details: {
      email: str(details.email),
      phone: str(details.phone),
      locationName: str(details.locationName),
      address: str(details.address),
      hours: Array.isArray(details.hours) ? (details.hours as Json[]).map((h) => ({ days: str(h.days) ?? '', hours: str(h.hours) ?? '' })) : [],
      mapUrl: str(details.mapUrl),
      mapLabel: str(details.mapLabel) ?? 'map',
      showSocial: bool(details.showSocial, true),
    },
    sections: sections(contactDoc.sections),
    seo: seo(contactDoc.seo),
  };
  const home = homepage(homeDoc);

  return {
    settings: settings(settingsDoc),
    seoDefaults: seoDefaults(seoDoc),
    homepage: home,
    menuPage,
    aboutPage,
    contactPage,
    pages: pageDocs.map(page).filter((x): x is CustomPage => Boolean(x)),
    design: design(designDoc),
    forms: formsConfig,
    menu: menu(categories, items),
    ...deriveFromPages(home),
  };
}
