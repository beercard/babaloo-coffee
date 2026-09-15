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
  admin: { group: t('Settings', 'Ajustes'), hidden: adminOnly, description: 'Site-wide defaults. Each page can override them in its own SEO box.' },
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

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: t('Home page', 'Página de inicio'),
  admin: { group: t('Home', 'Portada'), description: 'Drag sections to reorder them; untick "Show this section" to hide one without deleting it.' },
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
  admin: { group: t('Menu', 'Menú'), description: 'Intro text of the /menu page. Products and categories are managed in Menu → Products / Categories.' },
  access: globalAccess,
  hooks,
  fields: [
    {
      name: 'intro',
      type: 'group',
      label: 'Intro (hand-written style)',
      fields: [
        { name: 'title', type: 'text', label: 'Title', defaultValue: 'homemade creations' },
        { name: 'text', type: 'textarea', label: 'Text' },
      ],
    },
    { name: 'showPrices', type: 'checkbox', label: 'Show prices', defaultValue: true },
    seoGroup(),
  ],
};

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: t('About page', 'Página About'),
  admin: { group: t('Pages', 'Páginas') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: 'Title', defaultValue: 'About' },
    {
      name: 'frames',
      type: 'array',
      label: 'Framed photos (3)',
      maxRows: 3,
      admin: { description: 'Leave empty to use the "About — framed photos" gallery, then the location photos.' },
      fields: [imageField('image', 'Photo', true)],
    },
    { name: 'text', type: 'textarea', label: t('Text', 'Texto'), required: true },
    { name: 'showTeamSection', type: 'checkbox', label: 'Show "Join our team" section', defaultValue: true },
    imageField('teamImage', 'Team photo (next to the form)'),
    { name: 'showContactSection', type: 'checkbox', label: 'Show "Contact us" section', defaultValue: true },
    seoGroup(),
  ],
};

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: t('Contact page', 'Página Contacto'),
  admin: { group: t('Pages', 'Páginas') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: 'Title', defaultValue: 'Contact us' },
    { name: 'text', type: 'textarea', label: 'Intro text (optional)' },
    seoGroup(),
  ],
};

export const JoinPage: GlobalConfig = {
  slug: 'join-page',
  label: t('Join our team page', 'Página Únete al equipo'),
  admin: { group: t('Pages', 'Páginas') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: 'Title', defaultValue: 'Join our team' },
    { name: 'text', type: 'textarea', label: 'Intro text (optional)' },
    imageField('image', 'Photo'),
    { name: 'positions', type: 'array', label: 'Positions (dropdown)', fields: [{ name: 'label', type: 'text', required: true }] },
    { name: 'experienceLevels', type: 'array', label: 'Experience levels (dropdown)', fields: [{ name: 'label', type: 'text', required: true }] },
    seoGroup(),
  ],
};

export const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  label: t('Gallery page', 'Página Galería'),
  admin: { group: t('Pages', 'Páginas') },
  access: globalAccess,
  hooks,
  fields: [
    { name: 'title', type: 'text', label: 'Title', defaultValue: 'Gallery' },
    { name: 'text', type: 'textarea', label: 'Intro text (optional)' },
    { name: 'gallery', type: 'relationship', relationTo: 'galleries', label: 'Gallery to show', required: true },
    seoGroup(),
  ],
};

export const globals: GlobalConfig[] = [Homepage, MenuPage, AboutPage, ContactPage, JoinPage, GalleryPage, SiteSettings, SEODefaults];
