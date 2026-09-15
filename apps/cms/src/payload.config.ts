import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { MenuCategories } from './collections/MenuCategories';
import { MenuItems } from './collections/MenuItems';
import { Locations } from './collections/Locations';
import { Galleries } from './collections/Galleries';
import { Testimonials } from './collections/Testimonials';
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
    },
    // Sidebar order: groups are listed in the order collections/globals appear.
  },
  // Order here = order of the groups in the admin sidebar: Home · Menu · Media · Settings (· Pages from globals).
  collections: [Locations, Testimonials, MenuItems, MenuCategories, Media, Galleries, FormSubmissions, Users],
  globals,
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
