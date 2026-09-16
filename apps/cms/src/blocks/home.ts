/**
 * Home page sections. Each block = one section the editor can enable, reorder
 * and edit in place. The `blockType` values match `HomeSection.type` on the
 * frontend. Everything the home page shows (including the locations) lives
 * here, so the editor never has to look elsewhere.
 */
import type { Block, Field } from 'payload';
import { addressGroup, alignField, imageField, linkGroup } from '../fields';
import { t } from '../fields/i18n';

const enabled: Field = {
  name: 'enabled',
  type: 'checkbox',
  label: t('Show this section', 'Mostrar esta sección'),
  defaultValue: true,
};
const anchor: Field = {
  name: 'anchor',
  type: 'text',
  label: t('Anchor id (optional)', 'Ancla (opcional)'),
  admin: { description: t('Lets links jump to this section, e.g. "locations" → /#locations.', 'Permite enlazar a esta sección, p. ej. "locations" → /#locations.') },
};

const background = (options: string[]): Field => ({
  name: 'background',
  type: 'select',
  label: t('Background', 'Fondo'),
  defaultValue: options[0],
  options: options.map((o) => ({ label: o[0]!.toUpperCase() + o.slice(1), value: o })),
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: t('Hero photos (carousel)', 'Fotos del hero (carrusel)'), plural: t('Hero photos', 'Fotos del hero') },
  fields: [
    enabled,
    {
      name: 'slides',
      type: 'array',
      label: t('Photos — drag to reorder', 'Fotos — arrastra para ordenar'),
      labels: { singular: t('Photo', 'Foto'), plural: t('Photos', 'Fotos') },
      minRows: 1,
      fields: [
        imageField('image', t('Photo', 'Foto'), true),
        imageField('imageMobile', t('Phone version (optional, taller crop)', 'Versión móvil (opcional, recorte vertical)')),
        {
          type: 'collapsible',
          label: t('Text over the photo (optional — the design has none)', 'Texto sobre la foto (opcional — el diseño no lleva)'),
          admin: { initCollapsed: true },
          fields: [
            { name: 'title', type: 'text', label: t('Title', 'Título') },
            { name: 'subtitle', type: 'text', label: t('Subtitle', 'Subtítulo') },
            { name: 'text', type: 'textarea', label: t('Text', 'Texto') },
            linkGroup('cta', t('Button', 'Botón')),
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'interval', type: 'number', label: t('Seconds per photo', 'Segundos por foto'), defaultValue: 5, min: 3, max: 20, admin: { width: '50%' } },
        {
          name: 'height',
          type: 'select',
          label: t('Height', 'Altura'),
          defaultValue: 'tall',
          admin: { width: '50%', description: t('Phones always use a shorter version.', 'En el celular siempre se usa una versión más baja.') },
          options: [
            { label: t('Tall (900 px)', 'Alta (900 px)'), value: 'tall' },
            { label: t('Medium (680 px)', 'Media (680 px)'), value: 'medium' },
            { label: t('Short (460 px)', 'Baja (460 px)'), value: 'short' },
          ],
        },
      ],
    },
  ],
};

export const IconStripBlock: Block = {
  slug: 'iconStrip',
  labels: { singular: t('Sliding icons band', 'Franja de iconos'), plural: t('Sliding icons band', 'Franja de iconos') },
  fields: [
    enabled,
    { name: 'speed', type: 'number', label: t('Seconds per loop (higher = slower)', 'Segundos por vuelta (más alto = más lento)'), defaultValue: 40, min: 10, max: 120 },
    {
      name: 'icons',
      type: 'array',
      label: t('Custom icons (optional)', 'Iconos propios (opcional)'),
      labels: { singular: t('Icon', 'Icono'), plural: t('Icons', 'Iconos') },
      admin: {
        description: t(
          'Leave empty to use the nine hand-drawn icons. Upload light-coloured PNG or SVG files with a transparent background, about 300 x 200 px.',
          'Déjalo vacío para usar los nueve iconos dibujados. Sube PNG o SVG claros con fondo transparente, de unos 300 x 200 px.',
        ),
      },
      fields: [imageField('image', t('Icon', 'Icono'), true)],
    },
  ],
};

export const NavRowBlock: Block = {
  slug: 'navRow',
  labels: { singular: t('Links row (Locations · Menu · …)', 'Fila de enlaces (Locations · Menu · …)'), plural: t('Links row', 'Fila de enlaces') },
  fields: [enabled, { name: 'note', type: 'text', admin: { readOnly: true, description: t('The links themselves are managed by the super admin (Site settings → Navigation).', 'Los enlaces los gestiona el super admin (Ajustes del sitio → Navegación).') } }],
};

export const IntroBlock: Block = {
  slug: 'intro',
  labels: { singular: t('Welcome text', 'Texto de bienvenida'), plural: t('Welcome text', 'Texto de bienvenida') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title (optional)', 'Título (opcional)') },
    { name: 'text', type: 'textarea', label: t('Text', 'Texto'), required: true, admin: { description: t('Each line break is kept, as in the design.', 'Cada salto de línea se respeta, como en el diseño.') } },
    alignField('center'),
    linkGroup('cta', t('Button (optional)', 'Botón (opcional)')),
    anchor,
  ],
};

export const LocationsBlock: Block = {
  slug: 'locations',
  labels: { singular: t('Locations (gold frames)', 'Locales (marcos dorados)'), plural: t('Locations', 'Locales') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title (hidden, for screen readers)', 'Título (oculto, para lectores de pantalla)'), defaultValue: 'Locations' },
    { name: 'text', type: 'textarea', label: t('Text above the frames (optional)', 'Texto sobre los marcos (opcional)') },
    {
      name: 'items',
      type: 'array',
      label: t('Locations — one gold frame each', 'Locales — un marco dorado por cada uno'),
      labels: { singular: t('Location', 'Local'), plural: t('Locations', 'Locales') },
      admin: { description: t('The first one is used for Google (address, hours). Set "Coming soon" for future locations.', 'El primero se usa para Google (dirección, horario). Marca "Próximamente" en los locales futuros.') },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: t('Name (internal)', 'Nombre (interno)'), admin: { width: '40%' } },
            { name: 'scriptName', type: 'text', label: t('Hand-written name over the photo (optional)', 'Nombre manuscrito sobre la foto (opcional)'), admin: { width: '35%' } },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'open',
              label: t('Status', 'Estado'),
              admin: { width: '25%' },
              options: [
                { label: t('Open', 'Abierto'), value: 'open' },
                { label: t('Coming soon', 'Próximamente'), value: 'coming-soon' },
                { label: t('Hidden', 'Oculto'), value: 'closed' },
              ],
            },
          ],
        },
        imageField('image', t('Photo inside the frame', 'Foto dentro del marco')),
        addressGroup(),
        {
          type: 'row',
          fields: [
            { name: 'phone', type: 'text', label: t('Phone', 'Teléfono'), admin: { width: '50%' } },
            { name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } },
          ],
        },
        {
          name: 'hoursDisplay',
          type: 'array',
          label: t('Opening hours (as shown on the site)', 'Horario (tal como se muestra en la web)'),
          labels: { singular: t('Line', 'Línea'), plural: t('Lines', 'Líneas') },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'days', type: 'text', required: true, label: t('Days', 'Días'), admin: { width: '50%', placeholder: 'Monday - Friday' } },
                { name: 'hours', type: 'text', required: true, label: t('Hours', 'Horas'), admin: { width: '50%', placeholder: '7:00am - 6:00pm' } },
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: t('Hours for Google, map & coordinates', 'Horario para Google, mapa y coordenadas'),
          admin: { initCollapsed: true },
          fields: [
            {
              name: 'hoursSpec',
              type: 'array',
              label: t('Opening hours for Google (24h)', 'Horario para Google (24h)'),
              labels: { singular: t('Rule', 'Regla'), plural: t('Rules', 'Reglas') },
              fields: [
                { name: 'dayOfWeek', type: 'select', hasMany: true, required: true, label: t('Days', 'Días'), options: DAYS.map((d) => ({ label: d, value: d })) },
                {
                  type: 'row',
                  fields: [
                    { name: 'opens', type: 'text', required: true, label: t('Opens', 'Abre'), admin: { width: '50%', placeholder: '07:00' } },
                    { name: 'closes', type: 'text', required: true, label: t('Closes', 'Cierra'), admin: { width: '50%', placeholder: '18:00' } },
                  ],
                },
              ],
            },
            { name: 'mapUrl', type: 'text', label: t('Google Maps link', 'Enlace de Google Maps') },
            {
              name: 'geo',
              type: 'group',
              label: t('Coordinates (optional)', 'Coordenadas (opcional)'),
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'lat', type: 'number', label: t('Latitude', 'Latitud'), admin: { width: '50%' } },
                    { name: 'lng', type: 'number', label: t('Longitude', 'Longitud'), admin: { width: '50%' } },
                  ],
                },
              ],
            },
            { name: 'orderUrl', type: 'text', label: t('Order online link (optional)', 'Enlace de pedidos (opcional)') },
          ],
        },
        { name: 'note', type: 'text', label: t('Note shown instead of hours', 'Nota en lugar del horario'), admin: { description: t('e.g. "Coming soon".', 'p. ej. "Coming soon".') } },
      ],
    },
    { ...anchor, defaultValue: 'locations' },
  ],
};

export const ClubStripBlock: Block = {
  slug: 'clubStrip',
  labels: { singular: t('Dogs band ("coffee & matcha club")', 'Franja de perros ("coffee & matcha club")'), plural: t('Dogs band', 'Franja de perros') },
  fields: [enabled, { name: 'speed', type: 'number', label: t('Seconds per loop (higher = slower)', 'Segundos por vuelta (más alto = más lento)'), defaultValue: 40, min: 10, max: 120 }],
};

export const FeaturedMenuBlock: Block = {
  slug: 'featuredMenu',
  labels: { singular: t('Featured products', 'Productos destacados'), plural: t('Featured products', 'Productos destacados') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'homemade creations' },
    { name: 'text', type: 'textarea', label: t('Text (optional)', 'Texto (opcional)') },
    { name: 'limit', type: 'number', label: t('How many', 'Cuántos'), defaultValue: 4, min: 1, max: 12 },
    linkGroup('cta', t('Button (optional)', 'Botón (opcional)')),
    anchor,
  ],
  admin: { },
};

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: t('Photo gallery', 'Galería de fotos'), plural: t('Photo gallery', 'Galería de fotos') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title (optional)', 'Título (opcional)') },
    {
      name: 'images',
      type: 'array',
      label: t('Photos — drag to reorder', 'Fotos — arrastra para ordenar'),
      labels: { singular: t('Photo', 'Foto'), plural: t('Photos', 'Fotos') },
      fields: [imageField('image', t('Photo', 'Foto'), true), { name: 'caption', type: 'text', label: t('Caption (optional)', 'Pie de foto (opcional)') }],
    },
    { name: 'limit', type: 'number', label: t('Max photos shown', 'Máximo de fotos'), defaultValue: 12, min: 1, max: 60 },
    anchor,
  ],
};

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: t('Testimonials', 'Testimonios'), plural: t('Testimonials', 'Testimonios') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'familiar faces' },
    {
      name: 'items',
      type: 'array',
      label: t('Quotes', 'Frases'),
      labels: { singular: t('Quote', 'Frase'), plural: t('Quotes', 'Frases') },
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: t('Quote', 'Frase') },
        {
          type: 'row',
          fields: [
            { name: 'author', type: 'text', required: true, label: t('Name', 'Nombre'), admin: { width: '50%' } },
            { name: 'role', type: 'text', label: t('Context (optional)', 'Contexto (opcional)'), admin: { width: '50%' } },
          ],
        },
      ],
    },
    anchor,
  ],
};

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: t('Call to action', 'Llamada a la acción'), plural: t('Call to action', 'Llamada a la acción') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title', 'Título'), required: true },
    { name: 'text', type: 'textarea', label: t('Text (optional)', 'Texto (opcional)') },
    alignField('center'),
    linkGroup('cta', t('Button', 'Botón')),
    imageField('image', t('Image (optional)', 'Imagen (opcional)')),
    imageField('imageMobile', t('Phone image (optional)', 'Imagen móvil (opcional)')),
    background(['cream', 'concrete', 'sage', 'bark']),
    anchor,
  ],
};

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: t('Text block', 'Bloque de texto'), plural: t('Text block', 'Bloque de texto') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title (optional)', 'Título (opcional)') },
    { name: 'html', type: 'textarea', label: t('Content (simple HTML allowed: <p>, <strong>, <em>, <a>, <ul>, <li>, <h3>)', 'Contenido (HTML simple: <p>, <strong>, <em>, <a>, <ul>, <li>, <h3>)'), required: true },
    imageField('image', t('Image (optional)', 'Imagen (opcional)')),
    imageField('imageMobile', t('Phone image (optional)', 'Imagen móvil (opcional)')),
    {
      name: 'imagePosition',
      type: 'select',
      label: t('Image position', 'Posición de la imagen'),
      defaultValue: 'left',
      options: [
        { label: t('Image left', 'Imagen a la izquierda'), value: 'left' },
        { label: t('Image right', 'Imagen a la derecha'), value: 'right' },
      ],
    },
    alignField('left'),
    background(['cream', 'concrete', 'sage']),
    anchor,
  ],
};

export const FramesBlock: Block = {
  slug: 'frames',
  labels: { singular: t('Gold frames (photos / carousels)', 'Marcos dorados (fotos / carruseles)'), plural: t('Gold frames', 'Marcos dorados') },
  fields: [
    enabled,
    { name: 'title', type: 'text', label: t('Title (optional)', 'Título (opcional)') },
    {
      name: 'items',
      type: 'array',
      label: t('Frames (drag to reorder)', 'Marcos (arrastra para ordenar)'),
      labels: { singular: t('Frame', 'Marco'), plural: t('Frames', 'Marcos') },
      minRows: 1,
      admin: { description: t('Rows of 3 on desktop, 2 on tablets and 1 on phones; an incomplete last row is centred.', 'Filas de 3 en escritorio, 2 en tablet y 1 en celular; la última fila incompleta se centra.') },
      fields: [
        imageField('image', t('Photo', 'Foto'), true),
        {
          name: 'more',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: t('More photos (turns the frame into a swipeable carousel)', 'Más fotos (convierte el marco en un carrusel deslizable)'),
        },
        { name: 'label', type: 'text', label: t('Hand-written text over the photo (optional)', 'Texto manuscrito sobre la foto (opcional)') },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          label: t('Frames per row on desktop', 'Marcos por fila en escritorio'),
          defaultValue: '3',
          admin: { width: '50%' },
          options: ['2', '3', '4'].map((v) => ({ label: v, value: v })),
        },
        { name: 'autoplay', type: 'checkbox', label: t('Carousels move on their own', 'Los carruseles avanzan solos'), defaultValue: false, admin: { width: '50%' } },
      ],
    },
    anchor,
  ],
};

export const FormBlock: Block = {
  slug: 'form',
  labels: { singular: t('Form (Contact / Join our team)', 'Formulario (Contacto / Únete al equipo)'), plural: t('Forms', 'Formularios') },
  fields: [
    enabled,
    {
      name: 'form',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      label: t('Which form', 'Qué formulario'),
      admin: { description: t('Fields, recipients and messages are edited in Settings > Forms.', 'Campos, destinatarios y mensajes se editan en Ajustes > Formularios.') },
      options: [
        { label: t('Contact us', 'Contacto'), value: 'contact' },
        { label: t('Join our team', 'Únete al equipo'), value: 'careers' },
      ],
    },
    { name: 'title', type: 'text', label: t('Title (optional)', 'Título (opcional)') },
    { name: 'text', type: 'textarea', label: t('Intro text (optional)', 'Texto de intro (opcional)') },
    imageField('image', t('Photo next to the form (optional)', 'Foto junto al formulario (opcional)')),
    background(['cream', 'concrete', 'sage']),
    anchor,
  ],
};

export const SpacerBlock: Block = {
  slug: 'spacer',
  labels: { singular: t('Space / divider', 'Espacio / separador'), plural: t('Spaces', 'Espacios') },
  fields: [
    enabled,
    {
      type: 'row',
      fields: [
        {
          name: 'size',
          type: 'select',
          label: t('Height', 'Altura'),
          defaultValue: 'm',
          admin: { width: '50%' },
          options: [
            { label: 'S', value: 's' },
            { label: 'M', value: 'm' },
            { label: 'L', value: 'l' },
          ],
        },
        { name: 'line', type: 'checkbox', label: t('Show a thin line', 'Mostrar una línea fina'), defaultValue: false, admin: { width: '50%' } },
      ],
    },
    background(['cream', 'concrete', 'sage', 'bark']),
  ],
};

export const homeBlocks: Block[] = [
  HeroBlock,
  IconStripBlock,
  NavRowBlock,
  IntroBlock,
  LocationsBlock,
  ClubStripBlock,
  FeaturedMenuBlock,
  GalleryBlock,
  TestimonialsBlock,
  CtaBlock,
  RichTextBlock,
  FramesBlock,
  FormBlock,
  SpacerBlock,
];

/** Every section type works on any page (About / Contact / Menu extras and new pages). */
export const pageBlocks: Block[] = homeBlocks;
