/**
 * One global per page. Editors open a page and find every section of that
 * page inside it; nothing about a page lives anywhere else. SEO boxes are
 * only visible to super admins.
 */
import type { GlobalConfig } from 'payload';
import { isAdmin, isEditorOrAdmin, publicRead } from '../access/roles';
import { addressGroup, imageField, linkFields, linkGroup, seoGroup } from '../fields';
import { homeBlocks } from '../blocks/home';
import { triggerDeployGlobal } from '../hooks/triggerDeploy';
import { t } from '../fields/i18n';

const globalAccess = { read: publicRead, update: isEditorOrAdmin };
const adminOnlyAccess = { read: publicRead, update: isAdmin };
const adminOnly = ({ user }: { user?: { role?: string } | null }) => user?.role !== 'admin';
const hooks = { afterChange: [triggerDeployGlobal] };
const PAGES = t('Pages', 'Páginas');

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: t('Home page', 'Página de inicio'),
  admin: { group: PAGES, description: t('Every section of the home page, in order. Drag to reorder; untick "Show this section" to hide one without deleting it.', 'Todas las secciones de la portada, en orden. Arrastra para reordenar; desmarca "Mostrar esta sección" para ocultarla sin borrarla.') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'sections', type: 'blocks', label: t('Sections', 'Secciones'), blocks: homeBlocks },
    seoGroup(),
  ],
};

export const MenuPage: GlobalConfig = {
  slug: 'menu-page',
  label: t('Menu page', 'Página Menú'),
  admin: { group: PAGES, description: t('Intro text of the /menu page. The products and categories themselves are in the Menu group.', 'Texto de la página /menu. Los productos y categorías están en el grupo Menú.') },
  access: globalAccess,
  hooks,
  fields: [
    {
      name: 'intro',
      type: 'group',
      label: t('Intro', 'Intro'),
      fields: [
        { name: 'title', type: 'text', label: t('Title (hand-written style)', 'Título (estilo manuscrito)'), defaultValue: 'homemade creations' },
        { name: 'text', type: 'textarea', label: t('Text (blank line = new paragraph; the first paragraph is hand-written style)', 'Texto (línea en blanco = párrafo nuevo; el primero va en estilo manuscrito)') },
      ],
    },
    { name: 'showPrices', type: 'checkbox', label: t('Show prices', 'Mostrar precios'), defaultValue: true },
    seoGroup(),
  ],
};

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: t('About page', 'Página About'),
  admin: { group: PAGES, description: t('Sections of /about, top to bottom.', 'Secciones de /about, de arriba abajo.') },
  access: globalAccess,
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
              label: t('Framed photos (3 gold frames)', 'Fotos enmarcadas (3 marcos dorados)'),
              labels: { singular: t('Photo', 'Foto'), plural: t('Photos', 'Fotos') },
              maxRows: 3,
              fields: [imageField('image', t('Photo', 'Foto'), true)],
            },
          ],
        },
        {
          label: t('2 · Text', '2 · Texto'),
          fields: [{ name: 'text', type: 'textarea', label: t('Text', 'Texto'), required: true, admin: { description: t('Line breaks are kept.', 'Los saltos de línea se respetan.') } }],
        },
        {
          label: t('3 · Join our team', '3 · Únete al equipo'),
          fields: [
            { name: 'showTeamSection', type: 'checkbox', label: t('Show this section', 'Mostrar esta sección'), defaultValue: true },
            imageField('teamImage', t('Team photo (next to the form)', 'Foto del equipo (junto al formulario)')),
            { name: 'note', type: 'text', admin: { readOnly: true, description: t('The form texts, positions and experience options are edited in the "Join our team page".', 'Los textos del formulario, puestos y experiencia se editan en la "Página Únete al equipo".') } },
          ],
        },
        {
          label: t('4 · Contact', '4 · Contacto'),
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
  admin: { group: PAGES, description: t('Texts of /contact. Email, phone, address and hours come from the first location (Home page) and Site settings.', 'Textos de /contact. Email, teléfono, dirección y horario vienen del primer local (Página de inicio) y de Ajustes del sitio.') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'Contact us' },
    { name: 'text', type: 'textarea', label: t('Intro text (optional)', 'Texto de intro (opcional)') },
    seoGroup(),
  ],
};

export const JoinPage: GlobalConfig = {
  slug: 'join-page',
  label: t('Join our team page', 'Página Únete al equipo'),
  admin: { group: PAGES, description: t('Used on /join-our-team and in the "Join our team" section of About.', 'Se usa en /join-our-team y en la sección "Join our team" de About.') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'Join our team' },
    { name: 'text', type: 'textarea', label: t('Intro text (optional)', 'Texto de intro (opcional)') },
    imageField('image', t('Photo', 'Foto')),
    { name: 'positions', type: 'array', label: t('Positions (dropdown)', 'Puestos (desplegable)'), labels: { singular: t('Position', 'Puesto'), plural: t('Positions', 'Puestos') }, fields: [{ name: 'label', type: 'text', required: true, label: t('Position', 'Puesto') }] },
    { name: 'experienceLevels', type: 'array', label: t('Experience levels (dropdown)', 'Niveles de experiencia (desplegable)'), labels: { singular: t('Level', 'Nivel'), plural: t('Levels', 'Niveles') }, fields: [{ name: 'label', type: 'text', required: true, label: t('Level', 'Nivel') }] },
    seoGroup(),
  ],
};

export const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  label: t('Gallery page', 'Página Galería'),
  admin: { group: PAGES, description: t('The photos of /gallery (the home page preview uses the first ones). Drag to reorder.', 'Las fotos de /gallery (la vista previa de la portada usa las primeras). Arrastra para ordenar.') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: t('Title', 'Título'), defaultValue: 'Gallery' },
    { name: 'text', type: 'textarea', label: t('Intro text (optional)', 'Texto de intro (opcional)') },
    {
      name: 'images',
      type: 'array',
      label: t('Photos', 'Fotos'),
      labels: { singular: t('Photo', 'Foto'), plural: t('Photos', 'Fotos') },
      fields: [
        imageField('image', t('Photo', 'Foto'), true),
        { name: 'caption', type: 'text', label: t('Caption (optional)', 'Pie de foto (opcional)') },
      ],
    },
    seoGroup(),
  ],
};

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: t('Site settings', 'Ajustes del sitio'),
  admin: { group: t('Settings', 'Ajustes'), hidden: adminOnly, description: 'Business name, contact details, social links and navigation. Used on every page and for Google.' },
  access: adminOnlyAccess,
  hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Business',
          fields: [
            { type: 'row', fields: [{ name: 'name', type: 'text', required: true, label: 'Business name', defaultValue: 'Babaloo Coffee Club', admin: { width: '50%' } }, { name: 'legalName', type: 'text', label: 'Legal name (optional)', admin: { width: '50%' } }] },
            { name: 'tagline', type: 'text', label: 'Tagline', defaultValue: 'Coffee & Matcha Club' },
            imageField('logo', 'Logo (for Google / sharing — the website uses the built-in hand-drawn logo)'),
            { name: 'priceRange', type: 'select', label: 'Price range', defaultValue: '$$', options: ['$', '$$', '$$$'].map((v) => ({ label: v, value: v })) },
            { name: 'copyright', type: 'text', label: 'Copyright holder (footer)', defaultValue: 'Babaloo Coffee Club' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { type: 'row', fields: [{ name: 'phone', type: 'text', label: 'Phone', admin: { width: '50%' } }, { name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } }] },
            addressGroup(),
            { name: 'mapUrl', type: 'text', label: 'Google Maps link' },
            { name: 'orderUrl', type: 'text', label: 'Order online link (Toast)' },
          ],
        },
        {
          label: 'Social media',
          fields: [
            {
              name: 'social',
              type: 'array',
              label: 'Profiles',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      admin: { width: '30%' },
                      options: ['instagram', 'facebook', 'tiktok', 'x', 'youtube', 'whatsapp', 'other'].map((v) => ({ label: v[0]!.toUpperCase() + v.slice(1), value: v })),
                    },
                    { name: 'label', type: 'text', label: 'Label', admin: { width: '30%' } },
                    { name: 'url', type: 'text', required: true, label: 'URL', admin: { width: '40%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            { name: 'nav', type: 'array', label: 'Main menu + links row', admin: { description: 'Use "/#locations" to scroll to the locations on the home page.' }, fields: linkFields() },
            { name: 'footerNav', type: 'array', label: 'Footer links', fields: linkFields() },
            linkGroup('primaryCta', 'Primary button'),
            linkGroup('secondaryCta', 'Secondary button'),
          ],
        },
      ],
    },
  ],
};

export const SEODefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: t('SEO defaults', 'SEO por defecto'),
  admin: { group: t('Settings', 'Ajustes'), hidden: adminOnly, description: 'Site-wide defaults. Each page can override them in its own SEO box (super admin only).' },
  access: adminOnlyAccess,
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
export const globals: GlobalConfig[] = [Homepage, MenuPage, AboutPage, GalleryPage, ContactPage, JoinPage, SiteSettings, SEODefaults];
