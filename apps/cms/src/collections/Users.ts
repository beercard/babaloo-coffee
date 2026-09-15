import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminField } from '../access/roles';
import { t } from '../fields/i18n';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: t('Settings', 'Ajustes'),
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
    description: 'Super admins manage everything (including users). Editors edit content only.',
  },
  auth: {
    useAPIKey: true,
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    update: ({ req, id }) => (req.user as { role?: string; id?: unknown })?.role === 'admin' || req.user?.id === id,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  labels: { singular: t('User', 'Usuario'), plural: t('Users', 'Usuarios') },
  fields: [
    { name: 'name', type: 'text', label: t('Name', 'Nombre') },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { update: isAdminField, create: isAdminField },
      admin: { position: 'sidebar' },
    },
  ],
};
