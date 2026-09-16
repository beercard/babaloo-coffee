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
  /** Focal point in percent (0–100) used as object-position when the image is cropped. */
  focal?: { x: number; y: number };
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
  footerShowAddress: boolean;
  footerShowEmail: boolean;
  footerNote?: string;
}

export type Align = 'left' | 'center' | 'right';

/** Site-wide look from Settings > Design. Every value is optional: empty = original design. */
export interface Design {
  colors: Partial<Record<'ink' | 'cream' | 'bark' | 'creamBright' | 'sage' | 'concrete' | 'wood' | 'focus', string>>;
  type: {
    bodyFont: 'lato' | 'poppins';
    uiFont: 'poppins' | 'lato';
    scriptFont: 'jimmy' | 'delafield';
    textScale: number;
    titleScale: number;
    scriptScale: number;
    menuScale: number;
    navScale: number;
  };
  layout: { sectionSpacing: number; sideMargin: number; contentWidth: number; titleAlign: Align; animations: boolean };
  header: { size: 's' | 'm' | 'l'; logoScale: number; sticky: boolean; logo?: ImageRef; wood?: ImageRef; showCurtain: boolean; curtain?: ImageRef; menuLogo?: ImageRef };
  footer: { background: 'texture' | 'color'; color?: string; textColor?: string; logo?: ImageRef; showDogs: boolean; texture?: ImageRef };
}

export type FormFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'number' | 'date' | 'url' | 'file';
export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  width: 'half' | 'full';
  options: string[];
}
export interface FormConfig {
  fields: FormFieldConfig[];
  submitLabel: string;
  successMessage: string;
  subject: string;
}
export interface FormsConfig {
  contact: FormConfig;
  careers: FormConfig;
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
  /** Name as shown on the menu; may contain line breaks. */
  displayName?: string;
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
  labels: MenuLabel[];
  featured: boolean;
  available: boolean;
  order: number;
}

export interface MenuLabel {
  name: string;
  slug: string;
  kind: 'badge' | 'location';
  color?: string;
  textColor?: string;
  showBadge: boolean;
  order?: number;
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
  height: 'tall' | 'medium' | 'short';
}
export interface IconStripSection extends SectionBase {
  type: 'iconStrip';
  /** Seconds for one full loop. */
  speed: number;
  /** Custom icons; empty = the built-in drawings. */
  icons: ImageRef[];
}
export interface NavRowSection extends SectionBase {
  type: 'navRow';
}
export interface IntroSection extends SectionBase {
  type: 'intro';
  title?: string;
  text: string;
  cta?: Link;
  align: Align;
}
export interface LocationsSection extends SectionBase {
  type: 'locations';
  title?: string;
  text?: string;
  /** The locations themselves live inside the section (edited in place on the Home page). */
  items: Location[];
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
  images: GalleryImage[];
  limit: number;
  cta?: Link;
}
export interface TestimonialsSection extends SectionBase {
  type: 'testimonials';
  title?: string;
  items: Testimonial[];
}
export interface CtaSection extends SectionBase {
  type: 'cta';
  title: string;
  text?: string;
  cta: Link;
  image?: ImageRef;
  imageMobile?: ImageRef;
  background: 'cream' | 'concrete' | 'sage' | 'bark';
  align: Align;
}
export interface RichTextSection extends SectionBase {
  type: 'richText';
  title?: string;
  html: string;
  image?: ImageRef;
  imageMobile?: ImageRef;
  imagePosition: 'left' | 'right';
  background: 'cream' | 'concrete' | 'sage';
  align: Align;
}
export interface ClubStripSection extends SectionBase {
  type: 'clubStrip';
  speed: number;
}

/** A gold frame; more than one image turns it into a swipeable carousel. */
export interface FrameItem {
  images: ImageRef[];
  label?: string;
}
export interface FramesSection extends SectionBase {
  type: 'frames';
  title?: string;
  items: FrameItem[];
  columns: 2 | 3 | 4;
  autoplay: boolean;
}
export interface FormSection extends SectionBase {
  type: 'form';
  form: 'contact' | 'careers';
  title?: string;
  text?: string;
  image?: ImageRef;
  background: 'cream' | 'concrete' | 'sage';
}
export interface SpacerSection extends SectionBase {
  type: 'spacer';
  size: 's' | 'm' | 'l';
  line: boolean;
  background: 'cream' | 'concrete' | 'sage' | 'bark';
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
  | ClubStripSection
  | FramesSection
  | FormSection
  | SpacerSection;

export interface Homepage {
  sections: HomeSection[];
  seo: SEOMeta;
}

export interface MenuPage {
  intro: { title: string; text?: string; align: Align };
  showPrices: boolean;
  showLocationFilter: boolean;
  allLocationsLabel: string;
  sections: HomeSection[];
  seo: SEOMeta;
}

export interface JoinSection {
  title: string;
  text?: string;
  positions: string[];
  experienceLevels: string[];
}

export interface AboutPage {
  title: string;
  frames: FrameItem[];
  frameColumns: 2 | 3 | 4;
  framesAutoplay: boolean;
  text: string;
  textAlign: Align;
  showClubStrip: boolean;
  sections: HomeSection[];
  showTeamSection: boolean;
  teamImage?: ImageRef;
  /** "Join our team" form texts (the section lives on the About page). */
  join: JoinSection;
  showContactSection: boolean;
  seo: SEOMeta;
}

export interface ContactDetails {
  email?: string;
  phone?: string;
  locationName?: string;
  /** Multiline address; each line is rendered on its own row. */
  address?: string;
  hours: OpeningHoursDisplay[];
  mapUrl?: string;
  mapLabel?: string;
  showSocial: boolean;
}

export interface ContactPage {
  title: string;
  text?: string;
  /** Right column of /contact. Empty fields fall back to Site settings / the first location. */
  details: ContactDetails;
  sections: HomeSection[];
  seo: SEOMeta;
}

/** Extra page created in the CMS, published at /<slug>. */
export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  showTitle: boolean;
  background: 'cream' | 'concrete';
  intro?: string;
  sections: HomeSection[];
  seo: SEOMeta;
}

export interface SiteContent {
  settings: SiteSettings;
  seoDefaults: SEODefaults;
  homepage: Homepage;
  menuPage: MenuPage;
  aboutPage: AboutPage;
  contactPage: ContactPage;
  pages: CustomPage[];
  design: Design;
  forms: FormsConfig;
  menu: MenuData;
  /** Derived from the Home page "Locations" section (used by JSON-LD, contact page…). */
  locations: Location[];
  /** Derived: the Home page "Photo gallery" section as gallery "main". */
  galleries: Gallery[];
  /** Derived from the Home page "Testimonials" section. */
  testimonials: Testimonial[];
}
