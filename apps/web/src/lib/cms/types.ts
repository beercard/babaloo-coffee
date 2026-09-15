/**
 * Normalised content model consumed by the Astro components.
 *
 * Both content sources (Payload CMS and the local JSON seed) are mapped to
 * these types, so components never depend on the CMS response shape.
 */

export interface ImageRef {
  /** Absolute URL (CMS) or a key relative to `src/assets/`, e.g. `photos/hero-dogs.jpg`. */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface Link {
  label: string;
  href: string;
  /** Opens in a new tab with rel="noopener". Inferred from the href when omitted. */
  external?: boolean;
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'x' | 'youtube' | 'whatsapp' | 'other';
  label: string;
  url: string;
}

export interface Address {
  street: string;
  suite?: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
}

export interface OpeningHoursDisplay {
  /** e.g. "Monday - Friday" */
  days: string;
  /** e.g. "7:00am - 4:00pm" or "Closed" */
  hours: string;
}

export interface OpeningHoursSpec {
  /** Schema.org day names */
  dayOfWeek: string[];
  /** 24h "07:00" */
  opens: string;
  /** 24h "16:00" */
  closes: string;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  /** Hand-written name drawn over the framed photo (e.g. "rea farms"). */
  scriptName?: string;
  status: 'open' | 'coming-soon' | 'closed';
  address?: Address;
  phone?: string;
  email?: string;
  hoursDisplay: OpeningHoursDisplay[];
  hoursSpec: OpeningHoursSpec[];
  mapUrl?: string;
  geo?: { lat: number; lng: number };
  image?: ImageRef;
  orderUrl?: string;
  note?: string;
  order: number;
}

export interface SiteSettings {
  name: string;
  legalName?: string;
  tagline?: string;
  logo?: ImageRef;
  phone?: string;
  email?: string;
  address?: Address;
  social: SocialLink[];
  orderUrl?: string;
  mapUrl?: string;
  priceRange?: string;
  nav: Link[];
  footerNav: Link[];
  primaryCta?: Link;
  secondaryCta?: Link;
  copyright?: string;
}

export interface SEOMeta {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ImageRef;
  twitterCard?: 'summary' | 'summary_large_image';
  robots?: string;
}

export interface SEODefaults {
  titleTemplate: string;
  defaultTitle: string;
  description: string;
  ogImage?: ImageRef;
  twitterHandle?: string;
  robots: string;
  locale: string;
}

export interface HeroSlide {
  image: ImageRef;
  imageMobile?: ImageRef;
  title?: string;
  subtitle?: string;
  text?: string;
  cta?: Link;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  image?: ImageRef;
  order: number;
  active: boolean;
}

export interface MenuVariant {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** Numeric price in the site currency. Omit for "market price" items. */
  price?: number;
  /** Free-form price label that overrides the numeric price, e.g. "+$0.75". */
  priceLabel?: string;
  variants: MenuVariant[];
  image?: ImageRef;
  category: string;
  tags: string[];
  featured: boolean;
  available: boolean;
  order: number;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
  currency: string;
}

export interface GalleryImage {
  image: ImageRef;
  caption?: string;
  order: number;
}

export interface Gallery {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: GalleryImage[];
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  rating?: number;
  order: number;
}

/* ---------- Homepage sections (ordered, toggleable blocks) ---------- */

interface SectionBase {
  id: string;
  enabled: boolean;
  anchor?: string;
}
export interface HeroSection extends SectionBase {
  type: 'hero';
  slides: HeroSlide[];
  /** Seconds between slides. */
  interval: number;
}
export interface IconStripSection extends SectionBase {
  type: 'iconStrip';
  /** Seconds for one full loop. */
  speed: number;
}
export interface NavRowSection extends SectionBase {
  type: 'navRow';
}
export interface IntroSection extends SectionBase {
  type: 'intro';
  title?: string;
  text: string;
  cta?: Link;
}
export interface LocationsSection extends SectionBase {
  type: 'locations';
  title?: string;
  text?: string;
}
export interface FeaturedMenuSection extends SectionBase {
  type: 'featuredMenu';
  title?: string;
  text?: string;
  cta?: Link;
  limit: number;
}
export interface GallerySection extends SectionBase {
  type: 'gallery';
  title?: string;
  gallery: string;
  limit: number;
  cta?: Link;
}
export interface TestimonialsSection extends SectionBase {
  type: 'testimonials';
  title?: string;
}
export interface CtaSection extends SectionBase {
  type: 'cta';
  title: string;
  text?: string;
  cta: Link;
  image?: ImageRef;
  imageMobile?: ImageRef;
  background: 'cream' | 'concrete' | 'sage' | 'bark';
}
export interface RichTextSection extends SectionBase {
  type: 'richText';
  title?: string;
  html: string;
  image?: ImageRef;
  imageMobile?: ImageRef;
  imagePosition: 'left' | 'right';
  background: 'cream' | 'concrete' | 'sage';
}
export interface ClubStripSection extends SectionBase {
  type: 'clubStrip';
}

export type HomeSection =
  | HeroSection
  | IconStripSection
  | NavRowSection
  | IntroSection
  | LocationsSection
  | FeaturedMenuSection
  | GallerySection
  | TestimonialsSection
  | CtaSection
  | RichTextSection
  | ClubStripSection;

export interface Homepage {
  sections: HomeSection[];
  seo: SEOMeta;
}

export interface MenuPage {
  intro: { title: string; text?: string };
  showPrices: boolean;
  seo: SEOMeta;
}

export interface AboutPage {
  title: string;
  frames: ImageRef[];
  text: string;
  showTeamSection: boolean;
  teamImage?: ImageRef;
  showContactSection: boolean;
  seo: SEOMeta;
}

export interface ContactPage {
  title: string;
  text?: string;
  seo: SEOMeta;
}

export interface JoinPage {
  title: string;
  text?: string;
  positions: string[];
  experienceLevels: string[];
  image?: ImageRef;
  seo: SEOMeta;
}

export interface GalleryPage {
  title: string;
  text?: string;
  gallery: string;
  seo: SEOMeta;
}

export interface SiteContent {
  settings: SiteSettings;
  seoDefaults: SEODefaults;
  homepage: Homepage;
  menuPage: MenuPage;
  aboutPage: AboutPage;
  contactPage: ContactPage;
  joinPage: JoinPage;
  galleryPage: GalleryPage;
  menu: MenuData;
  locations: Location[];
  galleries: Gallery[];
  testimonials: Testimonial[];
}
