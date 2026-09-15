import type { CollectionConfig } from 'payload';
import { editorContentDeletable } from '../access/roles';
import { activeField, imageField, orderField, slugField } from '../fields';
import { triggerDeploy } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: t('Product', 'Producto'), plural: t('Products', 'Productos') },
  admin: {
    group: t('Menu', 'Menú'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'available', 'featured', 'order'],
    description: t('Every drink and dish. Change the price here and the website updates on the next publish.', 'Todas las bebidas y platos. Cambia el precio aquí y la web se actualiza en la próxima publicación.'),
    listSearchableFields: ['name', 'description'],
  },
  access: editorContentDeletable,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeploy] },
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
      name: 'tags',
      type: 'select',
      hasMany: true,
      label: t('Labels', 'Etiquetas'),
      options: [
        { label: 'New', value: 'New' },
        { label: 'Popular', value: 'Popular' },
        { label: 'Seasonal', value: 'Seasonal' },
        { label: 'Vegan', value: 'Vegan' },
        { label: 'Gluten free', value: 'Gluten free' },
        { label: 'Signature', value: 'Signature' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'featured', type: 'checkbox', label: t('Featured (home page)', 'Destacado (portada)'), defaultValue: false, admin: { position: 'sidebar' } },
    activeField('available', t('Available (shown on the menu)', 'Disponible (visible en el menú)')),
    orderField(),
    slugField('name'),
  ],
};
