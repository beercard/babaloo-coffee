import type { CollectionConfig } from 'payload';
import { draftContent } from '../access/roles';
import { activeField, collectionVersions, imageField, orderField, slugField } from '../fields';
import { triggerDeploy, triggerDeployDelete } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: t('Product', 'Producto'), plural: t('Products', 'Productos') },
  admin: {
    group: t('Menu', 'Menú'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'labels', 'available', 'order', '_status'],
    description: t(
      'Every drink and dish. Tip: tick several products in the list and use "Edit" to move them to another category or change a field in one go.',
      'Todas las bebidas y platos. Consejo: marca varios productos en la lista y usa "Editar" para moverlos de categoría o cambiar un campo de una vez.',
    ),
    listSearchableFields: ['name', 'description'],
  },
  access: draftContent,
  versions: collectionVersions,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeployDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: t('Name', 'Nombre'), admin: { width: '60%' } },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'menu-categories',
          required: true,
          label: t('Category / section', 'Categoría / sección'),
          admin: { width: '40%' },
        },
      ],
    },
    { name: 'description', type: 'textarea', label: t('Description', 'Descripción'), admin: { description: t('Ingredients or a short note, e.g. "cold foam served over iced espresso".', 'Ingredientes o una nota corta, p. ej. "cold foam served over iced espresso".') } },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: t('Price (USD)', 'Precio (USD)'),
          min: 0,
          admin: { width: '40%', step: 0.25, description: t('Numbers only, e.g. 5.5', 'Solo números, p. ej. 5.5') },
        },
        {
          name: 'priceLabel',
          type: 'text',
          label: t('Price text (optional)', 'Precio en texto (opcional)'),
          admin: { width: '60%', description: 'Overrides the number, e.g. "+$0.75" or "market price".' },
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      label: t('Sizes / variants (optional)', 'Tamaños / variantes (opcional)'),
      labels: { singular: 'Variant', plural: 'Variants' },
      admin: { description: 'e.g. Biscoff / Kinder Bueno / Nutella, or Small / Large with different prices.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: t('Name', 'Nombre'), admin: { width: '60%' } },
            { name: 'price', type: 'number', required: true, label: 'Price', min: 0, admin: { width: '40%', step: 0.25 } },
          ],
        },
      ],
    },
    imageField('image', t('Product photo (shown when the product is clicked)', 'Foto del producto (se muestra al hacer clic)')),
    {
      name: 'labels',
      type: 'relationship',
      relationTo: 'menu-labels',
      hasMany: true,
      label: t('Labels & locations', 'Etiquetas y locales'),
      admin: {
        position: 'sidebar',
        description: t(
          'Badges (Signature, New…) and the locations that sell it. No location label = sold everywhere. Create new labels in Menu > Labels.',
          'Distintivos (Signature, New…) y los locales que lo venden. Sin etiqueta de local = se vende en todos. Crea etiquetas nuevas en Menú > Etiquetas.',
        ),
      },
    },
    // Legacy fixed list, replaced by `labels` (kept hidden so older data is not lost).
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      admin: { hidden: true },
      options: ['New', 'Popular', 'Seasonal', 'Vegan', 'Gluten free', 'Signature', 'Rea Farms', 'South End', 'Lake Norman'].map((v) => ({ label: v, value: v })),
    },
    { name: 'featured', type: 'checkbox', label: t('Featured (home page)', 'Destacado (portada)'), defaultValue: false, admin: { position: 'sidebar' } },
    activeField('available', t('Available (shown on the menu)', 'Disponible (visible en el menú)')),
    orderField(),
    slugField('name'),
  ],
};
