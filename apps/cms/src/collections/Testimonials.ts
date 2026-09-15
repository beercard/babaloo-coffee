import type { CollectionConfig } from 'payload';
import { editorContentDeletable } from '../access/roles';
import { activeField, orderField } from '../fields';
import { triggerDeploy } from '../hooks/triggerDeploy';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    group: 'Home',
    useAsTitle: 'author',
    defaultColumns: ['author', 'quote', 'active', 'order'],
    description: 'Guest quotes. Shown on the home page when the "Testimonials" section is enabled.',
  },
  access: editorContentDeletable,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeploy] },
  fields: [
    { name: 'quote', type: 'textarea', required: true, label: 'Quote' },
    {
      type: 'row',
      fields: [
        { name: 'author', type: 'text', required: true, label: 'Name', admin: { width: '50%' } },
        { name: 'role', type: 'text', label: 'Context (optional)', admin: { width: '50%', placeholder: 'Regular since 2024' } },
      ],
    },
    { name: 'rating', type: 'number', label: 'Rating (1–5, optional)', min: 1, max: 5, admin: { position: 'sidebar' } },
    activeField(),
    orderField(),
  ],
};
