import type { CollectionConfig, Where } from 'payload';
import { editorContentDeletable } from '../access/roles';
import { activeField, imageField, orderField, slugField } from '../fields';
import { triggerDeploy } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  labels: { singular: t('Category', 'Categoría'), plural: t('Categories', 'Categorías') },
  admin: {
    group: t('Menu', 'Menú'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'order', 'active'],
    description: 'Top-level categories (Coffee, Matcha & more, Food and sweets…) and their sub-sections (Hot, Iced, Salty, Sweets). Set "Parent" to make a sub-section.',
    listSearchableFields: ['name'],
  },
  access: editorContentDeletable,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeploy] },
  fields: [
    { name: 'name', type: 'text', required: true, label: t('Name', 'Nombre') },
    { name: 'description', type: 'textarea', label: 'Short description (optional)' },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'menu-categories',
      label: t('Parent category', 'Categoría madre'),
      admin: { description: 'Leave empty for a top-level category. Pick "Coffee" to make this a section inside Coffee (e.g. Hot / Iced).', position: 'sidebar' },
      filterOptions: ({ id }): Where => {
        const where: Where = { parent: { exists: false } };
        if (id) where.id = { not_equals: id };
        return where;
      },
    },
    imageField('image', t('Category photo (shown when the category is opened)', 'Foto de la categoría (se muestra al abrirla)')),
    orderField(),
    activeField(),
    slugField('name'),
  ],
};
