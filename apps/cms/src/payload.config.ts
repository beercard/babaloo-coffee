import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import { en } from '@payloadcms/translations/languages/en';
import { es } from '@payloadcms/translations/languages/es';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { MenuCategories } from './collections/MenuCategories';
import { MenuItems } from './collections/MenuItems';
import { FormSubmissions } from './collections/FormSubmissions';
import { globals } from './globals';
import { formsSubmit, formsSubmitOptions } from './endpoints/formsSubmit';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const siteUrls = (process.env.SITE_URL ?? 'http://localhost:4321')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || undefined,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Babaloo CMS',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/icon.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/Logo#Logo',
        Icon: '/components/Icon#Icon',
      },
      views: {
        dashboard: { Component: '/components/Dashboard#Dashboard' },
      },
      afterNavLinks: ['/components/NavFooter#NavFooter'],
      actions: ['/components/HeaderActions#HeaderActions'],
    },
    // Sidebar order: groups are listed in the order collections/globals appear.
  },
  // Sidebar: Pages (globals) · Menu · Media · Messages · Settings.
  collections: [MenuItems, MenuCategories, Media, FormSubmissions, Users],
  globals,
  // Image library folders (one per page/section); the folder collection is created by Payload.
  folders: { slug: 'folders', browseByFolder: true, collectionSpecific: false },
  i18n: {
    supportedLanguages: { en, es },
    fallbackLanguage: 'en',
  },
  endpoints: [formsSubmit, formsSubmitOptions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./babaloo.db' },
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  cors: siteUrls,
  csrf: siteUrls,
  upload: {
    limits: { fileSize: 12 * 1024 * 1024 },
  },
});
