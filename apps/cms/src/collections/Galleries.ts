import type { CollectionConfig } from 'payload';
import { editorContentDeletable } from '../access/roles';
import { imageField, slugField } from '../fields';
import { triggerDeploy } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  labels: { singular: t('Gallery', 'Galería'), plural: t('Galleries', 'Galerías') },
  admin: {
    group: t('Media', 'Fotos'),
    useAsTitle: 'name',
    description: 'Photo sets used on the website. "Gallery" is the /gallery page; "About — framed photos" fills the three gold frames on the About page. Drag rows to reorder.',
  },
  access: editorContentDeletable,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeploy] },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Name' },
    { name: 'description', type: 'textarea', label: 'Description (optional)' },
    {
      name: 'images',
      type: 'array',
      label: t('Photos', 'Fotos'),
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [
        imageField('image', 'Photo', true),
        { name: 'alt', type: 'text', label: 'Description override (optional)', admin: { description: 'Uses the photo\'s own description when empty.' } },
        { name: 'caption', type: 'text', label: 'Caption (optional)' },
      ],
    },
    slugField('name'),
  ],
};
