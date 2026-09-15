/**
 * Reusable field factories. Field names mirror the frontend types in
 * apps/web/src/lib/cms/types.ts so the API needs almost no mapping.
 */
import type { Field, GroupField } from 'payload';
import { t } from './i18n';

export const orderField = (): Field => ({
  name: 'order',
  type: 'number',
  label: t('Order', 'Orden'),
  defaultValue: 0,
  admin: {
    position: 'sidebar',
    description: t('Lower numbers show first.', 'Los números más bajos salen primero.'),
    step: 1,
  },
});

export const slugField = (from = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'URL slug',
  unique: false,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-generated from the name. Used for links like /menu#latte.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const source = (value as string | undefined) || (data?.[from] as string | undefined) || '';
        return source
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      },
    ],
  },
});

export const imageField = (name = 'image', label: string | Record<string, string> = t('Image', 'Imagen'), required = false): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  label,
  required,
});

export const linkFields = (): Field[] => [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', label: 'Button / link text', admin: { width: '40%' } },
      { name: 'href', type: 'text', label: 'URL', admin: { width: '45%', placeholder: '/menu or https://…' } },
      { name: 'external', type: 'checkbox', label: 'New tab', admin: { width: '15%' } },
    ],
  },
];

export const linkGroup = (name: string, label: string): GroupField => ({
  name,
  type: 'group',
  label,
  fields: linkFields(),
});

export const seoGroup = (): GroupField => ({
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { description: t('Leave a field empty to use the site-wide default (Settings → SEO).', 'Deja un campo vacío para usar el valor por defecto del sitio (Ajustes → SEO).') },
  fields: [
    { name: 'title', type: 'text', label: 'SEO title', maxLength: 70 },
    { name: 'description', type: 'textarea', label: 'Meta description', maxLength: 170 },
    { name: 'canonical', type: 'text', label: 'Canonical URL', admin: { description: 'Only if this page should point to another URL.' } },
    {
      type: 'collapsible',
      label: 'Social sharing (Open Graph / X)',
      admin: { initCollapsed: true },
      fields: [
        { name: 'ogTitle', type: 'text', label: 'Share title' },
        { name: 'ogDescription', type: 'textarea', label: 'Share description' },
        imageField('ogImage', 'Share image (1200×630 recommended)'),
        {
          name: 'twitterCard',
          type: 'select',
          label: 'X card type',
          options: [
            { label: 'Large image', value: 'summary_large_image' },
            { label: 'Summary', value: 'summary' },
          ],
        },
      ],
    },
    {
      name: 'robots',
      type: 'select',
      label: 'Search engines',
      options: [
        { label: 'Index (default)', value: 'index, follow' },
        { label: 'Do not index', value: 'noindex, follow' },
      ],
    },
  ],
});

export const addressGroup = (): GroupField => ({
  name: 'address',
  type: 'group',
  label: 'Address',
  fields: [
    { type: 'row', fields: [{ name: 'street', type: 'text', label: 'Street', admin: { width: '60%' } }, { name: 'suite', type: 'text', label: 'Suite / unit', admin: { width: '40%' } }] },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', label: 'City', admin: { width: '40%' } },
        { name: 'region', type: 'text', label: 'State', admin: { width: '20%' } },
        { name: 'postalCode', type: 'text', label: 'ZIP', admin: { width: '20%' } },
        { name: 'country', type: 'text', label: 'Country', defaultValue: 'US', admin: { width: '20%' } },
      ],
    },
  ],
});

export const activeField = (name = 'active', label: string | Record<string, string> = t('Visible on the website', 'Visible en la web')): Field => ({
  name,
  type: 'checkbox',
  label,
  defaultValue: true,
  admin: { position: 'sidebar' },
});
