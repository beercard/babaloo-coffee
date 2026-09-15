import type { CollectionConfig } from 'payload';
import { editorContent } from '../access/roles';
import { addressGroup, imageField, orderField, slugField } from '../fields';
import { triggerDeploy } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const Locations: CollectionConfig = {
  slug: 'locations',
  labels: { singular: t('Location', 'Local'), plural: t('Locations', 'Locales') },
  admin: {
    group: t('Home', 'Portada'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'order'],
    description: 'The framed photos on the home page. Add a new location here and it appears automatically.',
  },
  access: editorContent,
  hooks: { afterChange: [triggerDeploy], afterDelete: [triggerDeploy] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: t('Name', 'Nombre'), admin: { width: '50%' } },
        {
          name: 'scriptName',
          type: 'text',
          label: t('Hand-written name over the photo', 'Nombre manuscrito sobre la foto'),
          admin: { width: '50%', description: 'e.g. "rea farms". Leave empty for none.' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: t('Open', 'Abierto'), value: 'open' },
        { label: t('Coming soon', 'Próximamente'), value: 'coming-soon' },
        { label: t('Closed (hidden)', 'Cerrado (oculto)'), value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    imageField('image', t('Photo inside the frame', 'Foto dentro del marco')),
    addressGroup(),
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Phone', admin: { width: '50%' } },
        { name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } },
      ],
    },
    {
      name: 'hoursDisplay',
      type: 'array',
      label: t('Opening hours (as shown on the site)', 'Horario (tal como se muestra en la web)'),
      labels: { singular: 'Line', plural: 'Lines' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'days', type: 'text', required: true, label: 'Days', admin: { width: '50%', placeholder: 'Monday - Friday' } },
            { name: 'hours', type: 'text', required: true, label: 'Hours', admin: { width: '50%', placeholder: '7:00am - 4:00pm' } },
          ],
        },
      ],
    },
    {
      name: 'hoursSpec',
      type: 'array',
      label: t('Opening hours for Google (structured data)', 'Horario para Google (datos estructurados)'),
      labels: { singular: 'Rule', plural: 'Rules' },
      admin: { description: 'Same information in a format search engines understand. 24h times, e.g. 07:00 and 16:00.' },
      fields: [
        {
          name: 'dayOfWeek',
          type: 'select',
          hasMany: true,
          required: true,
          label: 'Days',
          options: DAYS.map((d) => ({ label: d, value: d })),
        },
        {
          type: 'row',
          fields: [
            { name: 'opens', type: 'text', required: true, label: 'Opens', admin: { width: '50%', placeholder: '07:00' } },
            { name: 'closes', type: 'text', required: true, label: 'Closes', admin: { width: '50%', placeholder: '16:00' } },
          ],
        },
      ],
    },
    { name: 'mapUrl', type: 'text', label: t('Google Maps link', 'Enlace de Google Maps') },
    {
      name: 'geo',
      type: 'group',
      label: 'Coordinates (optional, for Google)',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'lat', type: 'number', label: 'Latitude', admin: { width: '50%' } },
            { name: 'lng', type: 'number', label: 'Longitude', admin: { width: '50%' } },
          ],
        },
      ],
    },
    { name: 'orderUrl', type: 'text', label: 'Order online link (optional, overrides the site-wide one)' },
    { name: 'note', type: 'text', label: 'Note shown instead of hours', admin: { description: 'e.g. "Coming soon" or "Opening spring 2027".' } },
    orderField(),
    slugField('name'),
  ],
};
