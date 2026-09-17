/**
 * One global per page, plus site-wide Settings, Design and Forms. Editors open a page and find
 * every section of that page inside it. Every global keeps a history (Versions tab) and supports
 * drafts: "Save draft" only updates the preview site, "Publish changes" updates the live site.
 * SEO boxes and SEO defaults are only visible to super admins.
 */
import type { Field, GlobalConfig } from 'payload';
import { isAdmin, isEditorOrAdmin, publicRead } from '../access/roles';
import { addressGroup, alignField, colorField, globalVersions, imageField, linkFields, linkGroup, seoGroup } from '../fields';
import { pageBlocks } from '../blocks/home';
import { triggerDeployGlobal } from '../hooks/triggerDeploy';
import { previewUrl } from '../hooks/preview';
import { t } from '../fields/i18n';

const globalAccess = { read: publicRead, update: isEditorOrAdmin, readVersions: isEditorOrAdmin };
const adminOnlyAccess = { read: publicRead, update: isAdmin, readVersions: isAdmin };
const adminOnly = ({ user }: { user?: { role?: string | null } | null }) => user?.role !== 'admin';
const hooks = { afterChange: [triggerDeployGlobal] };
const PAGES = t('Pages', 'Páginas');
const SETTINGS = t('Settings', 'Ajustes');

/** Optional sections an editor can stack below the fixed content of a page. */
const extraSections = (where: Record<string, string>): Field => ({
  name: 'sections',
  type: 'blocks',
  label: t('Extra sections', 'Secciones extra'),
  labels: { singular: t('Section', 'Sección'), plural: t('Sections', 'Secciones') },
  admin: { description: where, initCollapsed: true },
  blocks: pageBlocks,
});

const preview = (path: string) => (previewUrl(path) ? () => previewUrl(path) as string : undefined);

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: t('Home page', 'Página de inicio'),
  admin: {
    group: PAGES,
    description: t(
      'Every section of the home page, in order. Drag to reorder, use the row menu to duplicate, and untick "Show this section" to hide one without deleting it.',
      'Todas las secciones de la portada, en orden. Arrastra para reordenar, usa el menú de cada fila para duplicar y desmarca "Mostrar esta sección" para ocultarla sin borrarla.',
    ),
    preview: preview('/'),
  },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    { name: 'sections', type: 'blocks', label: t('Sections', 'Secciones'), labels: { singular: t('Section', 'Sección'), plural: t('Sections', 'Secciones') }, blocks: pageBlocks, admin: { initCollapsed: true } },
    seoGroup(),
  ],
};

export const MenuPage: GlobalConfig = {
  slug: 'menu-page',
  label: t('Menu page', 'Página Menú'),
  admin: {
    group: PAGES,
    description: t('Top of the /menu page and how the menu behaves. Products, categories and labels are in the Menu group.', 'Parte superior de /menu y cómo se comporta el menú. Productos, categorías y etiquetas están en el grupo Menú.'),
    preview: preview('/menu'),
  },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('1 · Intro', '1 · Intro'),
          fields: [
            {
              name: 'intro',
              type: 'group',
              label: t('Intro', 'Intro'),
              fields: [
                { name: 'title', type: 'textarea', label: t('Title (hand-written style, press Enter for a new line)', 'Título (estilo manuscrito, Enter = nueva línea)'), defaultValue: 'homemade creations', admin: { rows: 2 } },
                { name: 'text', type: 'textarea', label: t('Text (blank line = new paragraph; the first paragraph is hand-written style)', 'Texto (línea en blanco = párrafo nuevo; el primero va en estilo manuscrito)') },
                alignField('center'),
              ],
            },
          ],
        },
        {
          label: t('2 · Menu options', '2 · Opciones del menú'),
          fields: [
            { name: 'showPrices', type: 'checkbox', label: t('Show prices', 'Mostrar precios'), defaultValue: true },
            {
              name: 'showLocationFilter',
              type: 'checkbox',
              label: t('Show the location selector above the menu', 'Mostrar el selector de local sobre el menú'),
              defaultValue: true,
              admin: {
                description: t(
                  'Appears when at least one product has a location label (Menu > Labels, type "Location"). Products without a location label are available everywhere.',
                  'Aparece cuando al menos un producto tiene una etiqueta de local (Menú > Etiquetas, tipo "Local"). Los productos sin etiqueta de local están en todos los locales.',
                ),
              },
            },
            { name: 'allLocationsLabel', type: 'text', label: t('Text of the "all" button', 'Texto del botón "todos"'), defaultValue: 'All locations' },
          ],
        },
        {
          label: t('3 · Extra sections', '3 · Secciones extra'),
          fields: [extraSections(t('Shown below the menu.', 'Se muestran debajo del menú.'))],
        },
      ],
    },
    seoGroup(),
  ],
};

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: t('About page', 'Página About'),
  admin: { group: PAGES, description: t('Sections of /about, top to bottom.', 'Secciones de /about, de arriba abajo.'), preview: preview('/about') },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('1 · Title & framed photos', '1 · Título y fotos enmarcadas'),
          fields: [
            { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'About' },
            {
              name: 'frames',
              type: 'array',
              label: t('Gold frames (drag to reorder)', 'Marcos dorados (arrastra para ordenar)'),
              labels: { singular: t('Frame', 'Marco'), plural: t('Frames', 'Marcos') },
              admin: {
                description: t(
                  'Add as many frames as you like: rows of 3 on desktop (or the number below), 2 on tablets, 1 on phones. Add "More photos" to turn a frame into a swipeable carousel. These photos are only used here (folder "About · Frames"): to change one, upload a new photo instead of replacing a photo used on the Home page.',
                  'Agrega los marcos que quieras: filas de 3 en escritorio (o el número de abajo), 2 en tablet, 1 en celular. Agrega "Más fotos" para convertir un marco en un carrusel deslizable. Estas fotos se usan solo aquí (carpeta "About · Frames"): para cambiar una, sube una foto nueva en vez de reemplazar una foto que usa la Home.',
                ),
              },
              fields: [
                imageField('image', t('Photo', 'Foto'), true),
                {
                  name: 'more',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  label: t('More photos (swipeable carousel inside this frame)', 'Más fotos (carrusel deslizable dentro de este marco)'),
                },
                { name: 'label', type: 'text', label: t('Hand-written text over the photo (optional)', 'Texto manuscrito sobre la foto (opcional)') },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'frameColumns',
                  type: 'select',
                  label: t('Frames per row on desktop', 'Marcos por fila en escritorio'),
                  defaultValue: '3',
                  admin: { width: '50%' },
                  options: ['2', '3', '4'].map((v) => ({ label: v, value: v })),
                },
                { name: 'framesAutoplay', type: 'checkbox', label: t('Carousels move on their own', 'Los carruseles avanzan solos'), defaultValue: false, admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: t('2 · Text', '2 · Texto'),
          fields: [
            { name: 'text', type: 'textarea', label: t('Text', 'Texto'), required: true, admin: { description: t('Line breaks are kept.', 'Los saltos de línea se respetan.') } },
            alignField('center', 'textAlign'),
            { name: 'showClubStrip', type: 'checkbox', label: t('Show the dogs band below the text', 'Mostrar la franja de perros debajo del texto'), defaultValue: true },
          ],
        },
        {
          label: t('3 · Join our team', '3 · Únete al equipo'),
          fields: [
            { name: 'showTeamSection', type: 'checkbox', label: t('Show this section', 'Mostrar esta sección'), defaultValue: true },
            imageField('teamImage', t('Team photo (next to the form)', 'Foto del equipo (junto al formulario)')),
            {
              name: 'join',
              type: 'group',
              label: t('Form', 'Formulario'),
              admin: { description: t('The form fields, dropdown options and messages are edited in Settings > Forms.', 'Los campos, opciones de los desplegables y mensajes se editan en Ajustes > Formularios.') },
              fields: [
                { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'Join our team' },
                { name: 'text', type: 'textarea', label: t('Intro text (optional)', 'Texto de intro (opcional)') },
                // Legacy lists (now in Settings > Forms); kept so older data is not lost.
                { name: 'positions', type: 'array', admin: { hidden: true }, fields: [{ name: 'label', type: 'text' }] },
                { name: 'experienceLevels', type: 'array', admin: { hidden: true }, fields: [{ name: 'label', type: 'text' }] },
              ],
            },
          ],
        },
        {
          label: t('4 · Extra sections', '4 · Secciones extra'),
          fields: [extraSections(t('Shown after "Join our team", before the contact form.', 'Se muestran después de "Únete al equipo", antes del formulario de contacto.'))],
        },
        {
          label: t('5 · Contact', '5 · Contacto'),
          fields: [
            { name: 'showContactSection', type: 'checkbox', label: t('Show the contact form at the bottom', 'Mostrar el formulario de contacto al final'), defaultValue: true },
          ],
        },
      ],
    },
    seoGroup(),
  ],
};

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: t('Contact page', 'Página Contacto'),
  admin: {
    group: PAGES,
    description: t('Everything on /contact: the form texts on the left and the contact details on the right.', 'Todo lo de /contact: los textos del formulario a la izquierda y los datos de contacto a la derecha.'),
    preview: preview('/contact'),
  },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('1 · Form texts', '1 · Textos del formulario'),
          fields: [
            { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'Contact us' },
            { name: 'text', type: 'textarea', label: t('Intro text (optional)', 'Texto de intro (opcional)') },
          ],
        },
        {
          label: t('2 · Contact details (right column)', '2 · Datos de contacto (columna derecha)'),
          fields: [
            {
              name: 'details',
              type: 'group',
              label: t('Contact details', 'Datos de contacto'),
              admin: { description: t('Leave a field empty to hide it.', 'Deja un campo vacío para ocultarlo.') },
              fields: [
                { type: 'row', fields: [{ name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } }, { name: 'phone', type: 'text', label: t('Phone', 'Teléfono'), admin: { width: '50%' } }] },
                { name: 'locationName', type: 'text', label: t('Location name', 'Nombre del local'), admin: { placeholder: 'South End' } },
                { name: 'address', type: 'textarea', label: t('Address (one line per row)', 'Dirección (una línea por fila)'), admin: { placeholder: '1425 Winnifred St, Suite 117 / Charlotte, NC 28203' } },
                {
                  name: 'hours',
                  type: 'array',
                  label: t('Opening hours', 'Horario'),
                  labels: { singular: t('Line', 'Línea'), plural: t('Lines', 'Líneas') },
                  fields: [{ type: 'row', fields: [{ name: 'days', type: 'text', required: true, label: t('Days', 'Días'), admin: { width: '50%' } }, { name: 'hours', type: 'text', required: true, label: t('Hours', 'Horas'), admin: { width: '50%' } }] }],
                },
                { type: 'row', fields: [{ name: 'mapUrl', type: 'text', label: t('Map link', 'Enlace al mapa'), admin: { width: '70%' } }, { name: 'mapLabel', type: 'text', label: t('Map link text', 'Texto del enlace'), defaultValue: 'map', admin: { width: '30%' } }] },
                { name: 'showSocial', type: 'checkbox', label: t('Show social links (from Site settings)', 'Mostrar redes sociales (de Ajustes del sitio)'), defaultValue: true },
              ],
            },
          ],
        },
        {
          label: t('3 · Extra sections', '3 · Secciones extra'),
          fields: [extraSections(t('Shown below the form.', 'Se muestran debajo del formulario.'))],
        },
      ],
    },
    seoGroup(),
  ],
};

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: t('Site settings', 'Ajustes del sitio'),
  admin: {
    group: SETTINGS,
    description: t(
      'Business name, contact details, social links, navigation and footer texts. Used on every page and for Google.',
      'Nombre del negocio, datos de contacto, redes, navegación y textos del footer. Se usan en todas las páginas y para Google.',
    ),
  },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('Business', 'Negocio'),
          fields: [
            { type: 'row', fields: [{ name: 'name', type: 'text', required: true, label: t('Business name', 'Nombre del negocio'), defaultValue: 'Babaloo Coffee Club', admin: { width: '50%' } }, { name: 'legalName', type: 'text', label: t('Legal name (optional)', 'Razón social (opcional)'), admin: { width: '50%' } }] },
            { name: 'tagline', type: 'text', label: t('Tagline', 'Eslogan'), defaultValue: 'Coffee & Matcha Club' },
            imageField('logo', t('Logo for Google and sharing (the website logo is in Settings > Design)', 'Logo para Google y redes (el logo de la web está en Ajustes > Diseño)')),
            { name: 'priceRange', type: 'select', label: t('Price range', 'Rango de precios'), defaultValue: '$$', options: ['$', '$$', '$$$'].map((v) => ({ label: v, value: v })) },
          ],
        },
        {
          label: t('Contact', 'Contacto'),
          fields: [
            { type: 'row', fields: [{ name: 'phone', type: 'text', label: t('Phone', 'Teléfono'), admin: { width: '50%' } }, { name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } }] },
            addressGroup(),
            { name: 'mapUrl', type: 'text', label: t('Google Maps link', 'Enlace de Google Maps') },
            { name: 'orderUrl', type: 'text', label: t('Order online link (Toast)', 'Enlace de pedidos online (Toast)') },
          ],
        },
        {
          label: t('Social media', 'Redes sociales'),
          fields: [
            {
              name: 'social',
              type: 'array',
              label: t('Profiles (footer icons, menu overlay, contact page)', 'Perfiles (iconos del footer, menú desplegable, contacto)'),
              labels: { singular: t('Profile', 'Perfil'), plural: t('Profiles', 'Perfiles') },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      label: t('Network', 'Red'),
                      admin: { width: '30%' },
                      options: ['instagram', 'facebook', 'tiktok', 'x', 'youtube', 'whatsapp', 'other'].map((v) => ({ label: v[0]!.toUpperCase() + v.slice(1), value: v })),
                    },
                    { name: 'label', type: 'text', label: t('Label', 'Texto'), admin: { width: '30%' } },
                    { name: 'url', type: 'text', required: true, label: 'URL', admin: { width: '40%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: t('Navigation', 'Navegación'),
          description: t(
            'Links point to a page path ("/menu", "/about", "/my-new-page"), a section ("/#locations") or a full address ("https://…"). Drag to reorder; remove a row to hide the link.',
            'Los enlaces apuntan a una página ("/menu", "/about", "/mi-pagina-nueva"), a una sección ("/#locations") o a una dirección completa ("https://…"). Arrastra para ordenar; borra la fila para quitar el enlace.',
          ),
          fields: [
            { name: 'nav', type: 'array', label: t('Main menu (overlay) and home links row', 'Menú principal (desplegable) y fila de enlaces del inicio'), labels: { singular: t('Link', 'Enlace'), plural: t('Links', 'Enlaces') }, fields: linkFields() },
            { name: 'footerNav', type: 'array', label: t('Footer links', 'Enlaces del footer'), labels: { singular: t('Link', 'Enlace'), plural: t('Links', 'Enlaces') }, fields: linkFields() },
            { ...linkGroup('primaryCta', t('Primary button (optional)', 'Botón principal (opcional)')), admin: { hidden: true } },
            { ...linkGroup('secondaryCta', t('Secondary button (optional)', 'Botón secundario (opcional)')), admin: { hidden: true } },
          ],
        },
        {
          label: t('Footer', 'Footer'),
          fields: [
            { name: 'copyright', type: 'text', label: t('Copyright holder', 'Titular del copyright'), defaultValue: 'Babaloo Coffee Club', admin: { description: t('Shown as "© year name".', 'Se muestra como "© año nombre".') } },
            {
              type: 'row',
              fields: [
                { name: 'footerShowAddress', type: 'checkbox', label: t('Show the address', 'Mostrar la dirección'), defaultValue: true, admin: { width: '50%' } },
                { name: 'footerShowEmail', type: 'checkbox', label: t('Show the email', 'Mostrar el email'), defaultValue: true, admin: { width: '50%' } },
              ],
            },
            { name: 'footerNote', type: 'textarea', label: t('Extra line (optional)', 'Línea extra (opcional)'), admin: { rows: 2 } },
          ],
        },
      ],
    },
  ],
};

const fontOptions = {
  body: [
    { label: 'Lato (default)', value: 'lato' },
    { label: 'Poppins', value: 'poppins' },
  ],
  ui: [
    { label: 'Poppins (default)', value: 'poppins' },
    { label: 'Lato', value: 'lato' },
  ],
  script: [
    { label: 'Jimmy Script (default)', value: 'jimmy' },
    { label: 'Mrs Saint Delafield', value: 'delafield' },
  ],
};

const percent = (name: string, label: Record<string, string>, min: number, max: number, description?: Record<string, string>): Field => ({
  name,
  type: 'number',
  label,
  min,
  max,
  defaultValue: 100,
  admin: { step: 5, width: '33%', description: description ?? t('100 = design default.', '100 = valor del diseño.') },
});

export const Design: GlobalConfig = {
  slug: 'design',
  label: t('Design', 'Diseño'),
  admin: {
    group: SETTINGS,
    description: t(
      'Site-wide look: colours, fonts, sizes, spacing, header and footer. Empty fields use the original design, so you can always go back. Changes apply to desktop and mobile at once.',
      'Aspecto de todo el sitio: colores, tipografías, tamaños, espacios, header y footer. Los campos vacíos usan el diseño original, así siempre se puede volver atrás. Los cambios se aplican a escritorio y celular a la vez.',
    ),
    preview: preview('/'),
  },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: t('Colours', 'Colores'),
          fields: [
            {
              name: 'colors',
              type: 'group',
              label: false,
              fields: [
                { type: 'row', fields: [colorField('ink', t('Text & lines', 'Texto y líneas'), '#3c1a1e'), colorField('cream', t('Page background', 'Fondo de página'), '#f1ede7')] },
                { type: 'row', fields: [colorField('bark', t('Icons band & dark buttons', 'Franja de iconos y botones oscuros'), '#503226'), colorField('creamBright', t('Text on dark backgrounds', 'Texto sobre fondos oscuros'), '#f2eee7')] },
                { type: 'row', fields: [colorField('sage', t('Soft panels', 'Paneles suaves'), '#d0cebf'), colorField('concrete', t('Under the marble texture', 'Debajo de la textura de mármol'), '#a39c91')] },
                { type: 'row', fields: [colorField('wood', t('Header (under the wood photo) & phone status bar', 'Header (debajo de la madera) y barra del celular'), '#58473a'), colorField('focus', t('Keyboard focus ring', 'Borde de foco del teclado'), '#8a4b2a')] },
              ],
            },
          ],
        },
        {
          label: t('Fonts & sizes', 'Tipografías y tamaños'),
          fields: [
            {
              name: 'type',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'bodyFont', type: 'select', label: t('Body text', 'Texto'), defaultValue: 'lato', options: fontOptions.body, admin: { width: '33%' } },
                    { name: 'uiFont', type: 'select', label: t('Titles, menu & buttons', 'Títulos, menú y botones'), defaultValue: 'poppins', options: fontOptions.ui, admin: { width: '33%' } },
                    { name: 'scriptFont', type: 'select', label: t('Hand-written', 'Manuscrita'), defaultValue: 'jimmy', options: fontOptions.script, admin: { width: '33%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    percent('textScale', t('Body text size %', 'Tamaño del texto %'), 80, 130),
                    percent('titleScale', t('Titles size %', 'Tamaño de títulos %'), 70, 140),
                    percent('scriptScale', t('Hand-written size %', 'Tamaño manuscrita %'), 70, 140),
                  ],
                },
                { type: 'row', fields: [percent('menuScale', t('Menu list size %', 'Tamaño de la lista del menú %'), 70, 130), percent('navScale', t('Navigation links size %', 'Tamaño de los enlaces %'), 70, 140)] },
              ],
            },
          ],
        },
        {
          label: t('Layout & spacing', 'Diseño y espacios'),
          fields: [
            {
              name: 'layout',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    percent('sectionSpacing', t('Space between sections %', 'Espacio entre secciones %'), 40, 200),
                    percent('sideMargin', t('Side margins %', 'Márgenes laterales %'), 50, 200),
                    { name: 'contentWidth', type: 'number', label: t('Text column max width (px)', 'Ancho máximo del texto (px)'), min: 800, max: 1800, defaultValue: 1200, admin: { width: '33%', step: 20 } },
                  ],
                },
                alignField('center', 'titleAlign', t('Page titles alignment', 'Alineación de los títulos de página')),
                { name: 'animations', type: 'checkbox', label: t('Scroll animations (fade-in as you scroll)', 'Animaciones al hacer scroll'), defaultValue: true },
              ],
            },
          ],
        },
        {
          label: t('Header', 'Header'),
          fields: [
            {
              name: 'header',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'size',
                      type: 'select',
                      label: t('Header height', 'Altura del header'),
                      defaultValue: 'm',
                      admin: { width: '33%' },
                      options: [
                        { label: t('Small', 'Chico'), value: 's' },
                        { label: t('Medium (default)', 'Mediano (original)'), value: 'm' },
                        { label: t('Large', 'Grande'), value: 'l' },
                      ],
                    },
                    percent('logoScale', t('Logo size %', 'Tamaño del logo %'), 50, 160),
                    { name: 'sticky', type: 'checkbox', label: t('Stays visible when scrolling', 'Queda fijo al hacer scroll'), defaultValue: true, admin: { width: '33%' } },
                  ],
                },
                imageField('logo', t('Logo (optional, replaces the hand-drawn logo; light PNG/SVG with transparent background)', 'Logo (opcional, reemplaza el logo dibujado; PNG/SVG claro con fondo transparente)')),
                imageField('wood', t('Wood texture (optional; a seamless photo about 1000 px wide)', 'Textura de madera (opcional; foto continua de unos 1000 px de ancho)')),
                { name: 'showCurtain', type: 'checkbox', label: t('Show the curtain under the header', 'Mostrar la cortina debajo del header'), defaultValue: true },
                imageField('curtain', t('Curtain (optional; wide PNG with transparent bottom edge, about 2400 px)', 'Cortina (opcional; PNG ancho con borde inferior transparente, unos 2400 px)')),
                imageField('menuLogo', t('Logo inside the open menu (optional)', 'Logo dentro del menú abierto (opcional)')),
              ],
            },
          ],
        },
        {
          label: t('Footer & textures', 'Footer y texturas'),
          fields: [
            {
              name: 'footer',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'background',
                      type: 'select',
                      label: t('Footer background', 'Fondo del footer'),
                      defaultValue: 'texture',
                      admin: { width: '50%' },
                      options: [
                        { label: t('Marble texture (default)', 'Textura de mármol (original)'), value: 'texture' },
                        { label: t('Solid colour', 'Color liso'), value: 'color' },
                      ],
                    },
                    colorField('color', t('Footer colour (when "Solid colour")', 'Color del footer (si es "Color liso")'), '#a39c91'),
                  ],
                },
                colorField('textColor', t('Footer text colour', 'Color del texto del footer'), '#3c1a1e'),
                imageField('logo', t('Footer logo (optional)', 'Logo del footer (opcional)')),
                { name: 'showDogs', type: 'checkbox', label: t('Show the dogs next to the logo', 'Mostrar los perros junto al logo'), defaultValue: true },
                imageField(
                  'texture',
                  t(
                    'Marble / concrete texture (optional; used by the footer, contact page and menu photo panel; a seamless square photo, 720 to 1200 px)',
                    'Textura de mármol / concreto (opcional; se usa en el footer, contacto y panel de fotos del menú; foto cuadrada continua de 720 a 1200 px)',
                  ),
                ),
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** One field of a website form. `name` is the key stored with each message. */
const formFieldRows: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', required: true, label: t('Label', 'Etiqueta'), admin: { width: '40%' } },
      {
        name: 'type',
        type: 'select',
        required: true,
        defaultValue: 'text',
        label: t('Type', 'Tipo'),
        admin: { width: '30%' },
        options: [
          { label: t('Short text', 'Texto corto'), value: 'text' },
          { label: 'Email', value: 'email' },
          { label: t('Phone', 'Teléfono'), value: 'tel' },
          { label: t('Long text', 'Texto largo'), value: 'textarea' },
          { label: t('Dropdown', 'Desplegable'), value: 'select' },
          { label: t('Number', 'Número'), value: 'number' },
          { label: t('Date', 'Fecha'), value: 'date' },
          { label: t('Link (URL)', 'Enlace (URL)'), value: 'url' },
          { label: t('File upload (PDF / Word)', 'Subir archivo (PDF / Word)'), value: 'file' },
        ],
      },
      {
        name: 'width',
        type: 'select',
        defaultValue: 'half',
        label: t('Width', 'Ancho'),
        admin: { width: '30%', condition: (_d, sibling) => sibling?.type !== 'file' },
        options: [
          { label: t('Half', 'Mitad'), value: 'half' },
          { label: t('Full', 'Completo'), value: 'full' },
        ],
      },
    ],
  },
  {
    type: 'row',
    fields: [
      { name: 'required', type: 'checkbox', label: t('Required', 'Obligatorio'), defaultValue: false, admin: { width: '40%' } },
      {
        name: 'name',
        type: 'text',
        label: t('Internal key', 'Clave interna'),
        admin: { width: '60%', description: t('Filled in automatically from the label. Do not change it once messages exist.', 'Se completa sola a partir de la etiqueta. No la cambies si ya hay mensajes.') },
        hooks: {
          beforeValidate: [
            ({ value, siblingData }) => {
              if (siblingData?.type === 'file') return 'resume';
              if (typeof value === 'string' && value.trim()) return value.trim();
              const words = String(siblingData?.label ?? 'field')
                .normalize('NFD')
                .replace(/[^\w\s]/g, '')
                .trim()
                .split(/\s+/);
              return words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase())).join('') || 'field';
            },
          ],
        },
      },
    ],
  },
  {
    name: 'options',
    type: 'array',
    label: t('Dropdown options', 'Opciones del desplegable'),
    labels: { singular: t('Option', 'Opción'), plural: t('Options', 'Opciones') },
    admin: { condition: (_d, sibling) => sibling?.type === 'select' },
    fields: [{ name: 'label', type: 'text', required: true, label: t('Option', 'Opción') }],
  },
];

const formGroup = (name: string, label: Record<string, string>, defaults: { submit: string; success: string; subject: string }): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      name: 'fields',
      type: 'array',
      label: t('Fields (drag to reorder)', 'Campos (arrastra para ordenar)'),
      labels: { singular: t('Field', 'Campo'), plural: t('Fields', 'Campos') },
      admin: { initCollapsed: true, description: t('Half-width fields sit side by side on desktop; on phones every field takes the full width. Open a row to edit it.', 'Los campos de ancho "Mitad" van de a dos en escritorio; en el celular todos ocupan el ancho completo. Abrí una fila para editarla.') },
      fields: formFieldRows,
    },
    {
      type: 'row',
      fields: [
        { name: 'submitLabel', type: 'text', label: t('Send button text', 'Texto del botón enviar'), defaultValue: defaults.submit, admin: { width: '50%' } },
        { name: 'emailSubject', type: 'text', label: t('Email subject', 'Asunto del email'), defaultValue: defaults.subject, admin: { width: '50%' } },
      ],
    },
    { name: 'successMessage', type: 'text', label: t('Message after sending', 'Mensaje después de enviar'), defaultValue: defaults.success },
    { name: 'notifyEmail', type: 'text', label: t('Send these messages to (optional)', 'Enviar estos mensajes a (opcional)'), admin: { description: t('Overrides the general address above for this form. Several addresses: separate with commas.', 'Reemplaza la dirección general para este formulario. Varias direcciones: separadas por comas.') } },
  ],
});

export const Forms: GlobalConfig = {
  slug: 'forms',
  label: t('Forms', 'Formularios'),
  admin: {
    group: SETTINGS,
    description: t(
      'Fields, recipients and confirmation messages of the Contact and Join our team forms. Every message is also saved in Messages.',
      'Campos, destinatarios y mensajes de confirmación de los formularios de Contacto y Únete al equipo. Cada mensaje también se guarda en Mensajes.',
    ),
  },
  access: globalAccess,
  versions: globalVersions,
  hooks,
  fields: [
    {
      name: 'notifyEmail',
      type: 'text',
      label: t('Send form messages to', 'Enviar los mensajes a'),
      admin: {
        placeholder: 'info@babaloocoffeeclub.com',
        description: t('Several addresses: separate with commas. Empty = the address configured on the server.', 'Varias direcciones: separadas por comas. Vacío = la dirección configurada en el servidor.'),
      },
      validate: (value: unknown) =>
        !value || String(value).split(',').every((e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())) ? true : 'Use valid email addresses separated by commas',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: t('Contact us', 'Contacto'),
          fields: [formGroup('contact', t('Contact form', 'Formulario de contacto'), { submit: 'send', success: 'Thank you! Your message is on its way.', subject: 'New message' })],
        },
        {
          label: t('Join our team', 'Únete al equipo'),
          fields: [formGroup('careers', t('Join our team form', 'Formulario de empleo'), { submit: 'send', success: "Thank you! We'll be in touch soon.", subject: 'Job application' })],
        },
        {
          label: t('Status & test', 'Estado y prueba'),
          fields: [{ name: 'status', type: 'ui', admin: { components: { Field: '/components/FormsStatus#FormsStatus' } } }],
        },
      ],
    },
  ],
};

export const SEODefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: t('SEO defaults', 'SEO por defecto'),
  admin: { group: SETTINGS, hidden: adminOnly, description: 'Site-wide defaults. Each page can override them in its own SEO box (super admin only).' },
  access: adminOnlyAccess,
  versions: globalVersions,
  hooks,
  fields: [
    { name: 'titleTemplate', type: 'text', label: 'Title template', defaultValue: '%s | Babaloo Coffee Club', admin: { description: '%s is replaced by the page title.' } },
    { name: 'defaultTitle', type: 'text', label: 'Default title', defaultValue: 'Babaloo Coffee Club | Coffee & Matcha Club in Charlotte, NC' },
    { name: 'description', type: 'textarea', label: 'Default meta description', maxLength: 170 },
    imageField('ogImage', 'Default share image (1200×630)'),
    { name: 'twitterHandle', type: 'text', label: 'X / Twitter handle (optional)' },
    { name: 'robots', type: 'text', label: 'Robots', defaultValue: 'index, follow, max-image-preview:large' },
    { name: 'locale', type: 'text', label: 'Locale', defaultValue: 'en_US' },
  ],
};

/** Order = order in the sidebar: pages in site order, then settings. */
export const globals: GlobalConfig[] = [Homepage, MenuPage, AboutPage, ContactPage, SiteSettings, Design, Forms, SEODefaults];
