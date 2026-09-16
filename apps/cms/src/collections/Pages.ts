import type { CollectionConfig } from 'payload';
import { draftContent } from '../access/roles';
import { collectionVersions, seoGroup } from '../fields';
import { pageBlocks } from '../blocks/home';
import { triggerDeploy, triggerDeployDelete } from '../hooks/triggerDeploy';
import { previewUrl } from '../hooks/preview';
import { t } from '../fields/i18n';

/** Paths used by the built-in pages, legacy redirects and the site itself. */
export const RESERVED_SLUGS = ['menu', 'about', 'contact', 'contact-us', 'drinks', 'food', 'hours', 'gallery', 'join-our-team', 'admin', 'api', 'index', '404', 'robots-txt', 'sitemap', 'sitemap-index', 'fonts', 'brand', 'favicon', 'astro'];

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Extra pages built from the same sections as the home page, published at /<slug>. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: t('New page', 'Página nueva'), plural: t('New pages', 'Páginas nuevas') },
  admin: {
    group: t('Pages', 'Páginas'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: t(
      'Create extra pages (events, catering, careers…) from the same sections as the home page. Each one is published at /its-url. Add it to the menu in Settings > Site settings > Navigation.',
      'Crea páginas extra (eventos, catering, empleo…) con las mismas secciones que la portada. Cada una se publica en /su-url. Agrégala al menú en Ajustes > Ajustes del sitio > Navegación.',
    ),
    preview: (doc) => previewUrl(`/${String((doc as { slug?: string }).slug ?? '')}`) ?? null,
  },
  access: draftContent,
  versions: collectionVersions,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeployDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, label: t('Page title', 'Título de la página') },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL',
      admin: {
        position: 'sidebar',
        description: t('Filled in from the title, e.g. "catering" = babaloocoffeeclub.com/catering.', 'Se completa con el título, p. ej. "catering" = babaloocoffeeclub.com/catering.'),
      },
      hooks: {
        beforeValidate: [({ value, data }) => slugify(String(value || data?.title || ''))],
      },
      validate: (value: unknown) => {
        const v = String(value ?? '');
        if (!v) return 'Required';
        if (RESERVED_SLUGS.includes(v)) return `"${v}" is already used by the website, choose another URL`;
        return true;
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'showTitle', type: 'checkbox', label: t('Show the title at the top', 'Mostrar el título arriba'), defaultValue: true, admin: { width: '50%' } },
        {
          name: 'background',
          type: 'select',
          label: t('Page background', 'Fondo de la página'),
          defaultValue: 'cream',
          admin: { width: '50%' },
          options: [
            { label: t('Cream', 'Crema'), value: 'cream' },
            { label: t('Marble texture', 'Textura de mármol'), value: 'concrete' },
          ],
        },
      ],
    },
    { name: 'intro', type: 'textarea', label: t('Intro under the title (optional)', 'Intro debajo del título (opcional)') },
    {
      name: 'sections',
      type: 'blocks',
      label: t('Sections', 'Secciones'),
      labels: { singular: t('Section', 'Sección'), plural: t('Sections', 'Secciones') },
      admin: { initCollapsed: true },
      blocks: pageBlocks,
    },
    seoGroup(),
  ],
};
