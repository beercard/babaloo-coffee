import type { CollectionConfig } from 'payload';
import { isAdmin, isEditorOrAdmin } from '../access/roles';
import { t } from '../fields/i18n';

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: { singular: t('Message', 'Mensaje'), plural: t('Inbox', 'Mensajes') },
  admin: {
    group: t('Messages', 'Mensajes'),
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'form', 'status', 'createdAt'],
    description: 'Messages sent from the Contact and Join our team forms.',
  },
  access: {
    read: isEditorOrAdmin,
    create: () => false, // only the /api/forms/submit endpoint creates documents (via local API)
    update: isEditorOrAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'form',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Join our team', value: 'careers' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'summary', type: 'text', label: 'From', admin: { readOnly: true } },
    { name: 'email', type: 'email', admin: { readOnly: true } },
    { name: 'data', type: 'json', label: 'Submitted fields', admin: { readOnly: true } },
    {
      name: 'meta',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        { name: 'page', type: 'text' },
        { name: 'userAgent', type: 'text' },
        { name: 'ipHash', type: 'text' },
      ],
    },
  ],
};
