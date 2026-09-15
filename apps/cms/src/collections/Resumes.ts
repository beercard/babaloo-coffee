import type { CollectionConfig } from 'payload';
import path from 'path';
import { isAdmin, isEditorOrAdmin } from '../access/roles';
import { t } from '../fields/i18n';

/** Résumés uploaded from the "Join our team" form. Private: only logged-in users can open them. */
const resumesDir = process.env.RESUMES_DIR ?? path.resolve(process.env.MEDIA_DIR ?? path.resolve(process.cwd(), 'media'), 'resumes');

export const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const Resumes: CollectionConfig = {
  slug: 'resumes',
  labels: { singular: t('Résumé', 'Currículum'), plural: t('Résumés', 'Currículums') },
  admin: {
    group: t('Messages', 'Mensajes'),
    useAsTitle: 'applicant',
    defaultColumns: ['applicant', 'filename', 'createdAt'],
    description: t('Files attached to job applications. Open the message to see the applicant.', 'Archivos adjuntos a las solicitudes de empleo. Abre el mensaje para ver el candidato.'),
  },
  access: {
    read: isEditorOrAdmin,
    create: () => false, // only the /api/forms/submit endpoint uploads (via local API)
    update: () => false,
    delete: isAdmin,
  },
  upload: {
    staticDir: resumesDir,
    mimeTypes: RESUME_MIME_TYPES,
    disableLocalStorage: false,
  },
  fields: [{ name: 'applicant', type: 'text', label: t('Applicant', 'Candidato'), admin: { readOnly: true } }],
};
