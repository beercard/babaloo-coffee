import type { CollectionConfig } from 'payload';
import { editorContentDeletable } from '../access/roles';
import { activeField, imageField, orderField, slugField } from '../fields';
import { triggerDeploy } from '../hooks/triggerDeploy';

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    group: 'Menu',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'available', 'featured', 'order'],
    description: 'Every drink and dish. Change the price here and the website updates on the next publish.',
    listSearchableFields: ['name', 'description'],
  },
  access: editorContentDeletable,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeploy] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Name', admin: { width: '60%' } },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'menu-categories',
          required: true,
          label: 'Category / section',
          admin: { width: '40%' },
        },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Description', admin: { description: 'Ingredients or a short note, e.g. "cold foam served over iced espresso".' } },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Price (USD)',
          min: 0,
          admin: { width: '40%', step: 0.25, description: 'Numbers only, e.g. 5.5' },
        },
        {
          name: 'priceLabel',
          type: 'text',
          label: 'Price text (optional)',
          admin: { width: '60%', description: 'Overrides the number, e.g. "+$0.75" or "market price".' },
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      label: 'Sizes / variants (optional)',
      labels: { singular: 'Variant', plural: 'Variants' },
      admin: { description: 'e.g. Biscoff / Kinder Bueno / Nutella, or Small / Large with different prices.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Name', admin: { width: '60%' } },
            { name: 'price', type: 'number', required: true, label: 'Price', min: 0, admin: { width: '40%', step: 0.25 } },
          ],
        },
      ],
    },
    imageField('image', 'Product photo (shown when the product is clicked)'),
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      label: 'Labels',
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
    { name: 'featured', type: 'checkbox', label: 'Featured (home page)', defaultValue: false, admin: { position: 'sidebar' } },
    activeField('available', 'Available (shown on the menu)'),
    orderField(),
    slugField('name'),
  ],
};
