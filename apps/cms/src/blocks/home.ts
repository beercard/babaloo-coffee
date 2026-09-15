/**
 * Home page sections. Each block = one section the editor can enable, reorder
 * and edit. The `blockType` values match `HomeSection.type` on the frontend.
 */
import type { Block, Field } from 'payload';
import { imageField, linkGroup } from '../fields';
import { t } from '../fields/i18n';

const enabled: Field = {
  name: 'enabled',
  type: 'checkbox',
  label: t('Show this section', 'Mostrar esta sección'),
  defaultValue: true,
};
const anchor: Field = {
  name: 'anchor',
  type: 'text',
  label: 'Anchor id (optional)',
  admin: { description: 'Lets links jump to this section, e.g. "locations" → /#locations.' },
};

const background = (options: string[]): Field => ({
  name: 'background',
  type: 'select',
  defaultValue: options[0],
  options: options.map((o) => ({ label: o[0]!.toUpperCase() + o.slice(1), value: o })),
});

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: t('Hero photos', 'Fotos del hero'), plural: t('Hero photos', 'Fotos del hero') },
  fields: [
    enabled,
    {
      name: 'slides',
      type: 'array',
      label: t('Photos (they fade from one to the next)', 'Fotos (se alternan con fundido)'),
      minRows: 1,
      fields: [
        imageField('image', 'Photo', true),
        imageField('imageMobile', 'Phone version (optional, taller crop)'),
        {
          type: 'collapsible',
          label: 'Text over the photo (optional — the design has none)',
          admin: { initCollapsed: true },
          fields: [
            { name: 'title', type: 'text', label: 'Title' },
            { name: 'subtitle', type: 'text', label: 'Subtitle' },
            { name: 'text', type: 'textarea', label: 'Text' },
            linkGroup('cta', 'Button'),
          ],
        },
      ],
    },
    { name: 'interval', type: 'number', label: 'Seconds per photo', defaultValue: 5, min: 3, max: 20 },
  ],
};

export const IconStripBlock: Block = {
  slug: 'iconStrip',
  labels: { singular: 'Sliding icons band', plural: 'Sliding icons band' },
  fields: [enabled, { name: 'speed', type: 'number', label: 'Seconds per loop (higher = slower)', defaultValue: 40, min: 10, max: 120 }],
};

export const NavRowBlock: Block = {
  slug: 'navRow',
  labels: { singular: 'Links row (Locations · Menu · …)', plural: 'Links row' },
  admin: { },
  fields: [enabled, { name: 'note', type: 'text', admin: { readOnly: true, description: 'Links are managed in Settings → Site settings → Navigation.' } }],
};

export const IntroBlock: Block = {
  slug: 'intro',
  labels: { singular: t('Intro text', 'Texto de bienvenida'), plural: t('Intro text', 'Texto de bienvenida') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: 'Title (optional)' },
    { name: 'text', type: 'textarea', label: t('Text', 'Texto'), required: true, admin: { description: t('Each line break is kept, as in the design.', 'Cada salto de línea se respeta, como en el diseño.') } },
    linkGroup('cta', 'Button (optional)'),
    anchor,
  ],
};

export const LocationsBlock: Block = {
  slug: 'locations',
  labels: { singular: t('Locations (gold frames)', 'Locales (marcos dorados)'), plural: t('Locations', 'Locales') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: 'Title (hidden, for screen readers)', defaultValue: 'Locations' },
    { name: 'text', type: 'textarea', label: 'Text above the frames (optional)' },
    { ...anchor, defaultValue: 'locations' },
  ],
};

export const ClubStripBlock: Block = {
  slug: 'clubStrip',
  labels: { singular: 'Dogs band ("coffee & matcha club")', plural: 'Dogs band' },
  fields: [enabled],
};

export const FeaturedMenuBlock: Block = {
  slug: 'featuredMenu',
  labels: { singular: 'Featured products', plural: 'Featured products' },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: 'Title', defaultValue: 'homemade creations' },
    { name: 'text', type: 'textarea', label: 'Text (optional)' },
    { name: 'limit', type: 'number', label: 'How many', defaultValue: 4, min: 1, max: 12 },
    linkGroup('cta', 'Button (optional)'),
    anchor,
  ],
};

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Photo gallery', plural: 'Photo gallery' },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: 'Title (optional)' },
    { name: 'gallery', type: 'relationship', relationTo: 'galleries', required: true, label: 'Gallery' },
    { name: 'limit', type: 'number', label: 'Max photos', defaultValue: 6, min: 1, max: 40 },
    linkGroup('cta', 'Button (optional)'),
    anchor,
  ],
};

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [enabled, { name: 'title', type: 'text', label: 'Title', defaultValue: 'familiar faces' }, anchor],
};

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Call to action' },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'text', type: 'textarea', label: 'Text (optional)' },
    linkGroup('cta', 'Button'),
    imageField('image', 'Image (optional)'),
    imageField('imageMobile', 'Phone image (optional)'),
    background(['cream', 'concrete', 'sage', 'bark']),
    anchor,
  ],
};

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text block', plural: 'Text block' },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: 'Title (optional)' },
    { name: 'html', type: 'textarea', label: 'Content (simple HTML allowed: <p>, <strong>, <em>, <a>, <ul>, <li>, <h3>)', required: true },
    imageField('image', 'Image (optional)'),
    imageField('imageMobile', 'Phone image (optional)'),
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Image left', value: 'left' },
        { label: 'Image right', value: 'right' },
      ],
    },
    background(['cream', 'concrete', 'sage']),
    anchor,
  ],
};

export const homeBlocks: Block[] = [
  HeroBlock,
  IconStripBlock,
  NavRowBlock,
  IntroBlock,
  LocationsBlock,
  ClubStripBlock,
  FeaturedMenuBlock,
  GalleryBlock,
  TestimonialsBlock,
  CtaBlock,
  RichTextBlock,
];
