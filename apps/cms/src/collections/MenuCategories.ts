import type { CollectionConfig, Where } from 'payload';
import { draftContent } from '../access/roles';
import { activeField, collectionVersions, imageField, orderField, slugField } from '../fields';
import { triggerDeploy, triggerDeployDelete } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  labels: { singular: t('Category', 'Categoría'), plural: t('Categories', 'Categorías') },
  admin: {
    group: t('Menu', 'Menú'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'order', 'active'],
    description: t(
      'Top-level categories (Coffee, Matcha, Food…) and their sub-sections (Hot, Iced…). Set "Parent category" to make a sub-section; "Order" sets the position. The menu re-centres itself whatever the number of categories.',
      'Categorías principales (Coffee, Matcha, Food…) y sus secciones (Hot, Iced…). Elige "Categoría madre" para crear una sección; "Orden" define la posición. El menú se vuelve a centrar solo con cualquier cantidad de categorías.',
    ),
    listSearchableFields: ['name'],
  },
  access: draftContent,
  versions: collectionVersions,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeployDelete] },
  fields: [
    { name: 'name', type: 'text', required: true, label: t('Name', 'Nombre') },
    {
      name: 'displayName',
      type: 'textarea',
      label: t('Name as shown on the menu (optional, Enter = line break)', 'Nombre tal como se ve en el menú (opcional, Enter = salto de línea)'),
      admin: { rows: 2 },
    },
    { name: 'description', type: 'textarea', label: t('Short description (optional)', 'Descripción corta (opcional)') },
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
