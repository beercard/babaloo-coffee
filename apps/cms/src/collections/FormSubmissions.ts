import type { CollectionConfig } from 'payload';
import { isEditorOrAdmin } from '../access/roles';
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
    delete: isEditorOrAdmin, // editors clean their own inbox
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
    { name: 'summary', type: 'text', label: t('From', 'De'), admin: { readOnly: true, position: 'sidebar' } },
    { name: 'email', type: 'email', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'data',
      type: 'json',
      label: t('Message', 'Mensaje'),
      admin: { readOnly: true, components: { Field: '/components/SubmissionFields#SubmissionFields' } },
    },
    { name: 'resume', type: 'upload', relationTo: 'resumes', label: t('Résumé', 'Currículum'), admin: { readOnly: true } },
    {
      name: 'meta',
      type: 'group',
      admin: { readOnly: true, hidden: true }, // technical details, kept for abuse tracing only
      fields: [
        { name: 'page', type: 'text' },
        { name: 'userAgent', type: 'text' },
        { name: 'ipHash', type: 'text' },
      ],
    },
  ],
};
