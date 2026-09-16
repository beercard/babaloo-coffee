import type { CollectionConfig } from 'payload';
import { draftContent } from '../access/roles';
import { collectionVersions, colorField, orderField, slugField } from '../fields';
import { triggerDeploy, triggerDeployDelete } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

/**
 * Product labels ("Signature", "New"…) and location labels ("Rea Farms"…). A product with one or
 * more location labels is only listed at those locations when a visitor picks one on the menu.
 */
export const MenuLabels: CollectionConfig = {
  slug: 'menu-labels',
  labels: { singular: t('Label', 'Etiqueta'), plural: t('Labels', 'Etiquetas') },
  admin: {
    group: t('Menu', 'Menú'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'color', 'order'],
    description: t(
      'Badges shown next to product names. "Location" labels also power the location selector of the menu: a product with location labels only appears at those locations.',
      'Distintivos junto al nombre de los productos. Las etiquetas de tipo "Local" además alimentan el selector de local del menú: un producto con etiquetas de local solo aparece en esos locales.',
    ),
  },
  access: draftContent,
  versions: collectionVersions,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeployDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: t('Text', 'Texto'), admin: { width: '50%' } },
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'badge',
          label: t('Type', 'Tipo'),
          admin: { width: '50%' },
          options: [
            { label: t('Badge (Signature, New…)', 'Distintivo (Signature, New…)'), value: 'badge' },
            { label: t('Location (only sold there)', 'Local (solo se vende ahí)'), value: 'location' },
          ],
        },
      ],
    },
    { type: 'row', fields: [colorField('color', t('Badge colour', 'Color del distintivo'), '#503226'), colorField('textColor', t('Text colour', 'Color del texto'), '#f2eee7')] },
    { name: 'showBadge', type: 'checkbox', label: t('Show as a badge next to the product', 'Mostrar como distintivo junto al producto'), defaultValue: true },
    orderField(),
    slugField('name'),
  ],
};
