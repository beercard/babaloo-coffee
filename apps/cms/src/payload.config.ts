import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { s3Storage } from '@payloadcms/storage-s3';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import { en } from '@payloadcms/translations/languages/en';
import { es } from '@payloadcms/translations/languages/es';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { MenuCategories } from './collections/MenuCategories';
import { MenuItems } from './collections/MenuItems';
import { MenuLabels } from './collections/MenuLabels';
import { Pages } from './collections/Pages';
import { FormSubmissions } from './collections/FormSubmissions';
import { Resumes } from './collections/Resumes';
import { globals } from './globals';
import { withRowLabels } from './fields/rowLabels';
import { formsStatus, formsSubmit, formsSubmitOptions, formsTest } from './endpoints/formsSubmit';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Website origins allowed to call the CMS (the preview site included).
const siteUrls = [process.env.SITE_URL ?? 'http://localhost:4321', process.env.PREVIEW_URL ?? '']
  .join(',')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

/**
 * Serverless hosting (Vercel) has no persistent disk, so there:
 *  - the SQLite database lives in Turso (DATABASE_URL=libsql://… + DATABASE_AUTH_TOKEN)
 *  - uploads go to Vercel Blob (BLOB_READ_WRITE_TOKEN). Without the token, files stay in apps/cms/media.
 * Schema sync: `push` runs in dev (and when DB_PUSH=1), so seeding from a dev machine against Turso
 * creates the tables; in production the schema is expected to exist already.
 */
// `BLOBB_…` is accepted too (the Vercel project keeps the store under that name).
const blobToken = (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOBB_READ_WRITE_TOKEN || '').trim().replace(/^"|"$/g, '') || undefined;

/**
 * Where uploads live, in order of preference:
 *  1. S3-compatible bucket (Cloudflare R2, AWS S3…) when S3_BUCKET is set — photos are served from
 *     S3_PUBLIC_URL (the bucket's public domain); résumés stay private and are streamed by the CMS.
 *  2. Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
 *  3. The server's disk (MEDIA_DIR / RESUMES_DIR) — use a folder outside the app so deploys keep it.
 */
const s3 = process.env.S3_BUCKET
  ? {
      bucket: process.env.S3_BUCKET,
      publicUrl: process.env.S3_PUBLIC_URL?.trim().replace(/\/$/, ''),
      config: {
        endpoint: process.env.S3_ENDPOINT || undefined,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: true,
        credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '' },
      },
    }
  : undefined;

/** Outgoing email (form notifications) over SMTP, e.g. Hostinger: smtp.hostinger.com:465 with the info@ mailbox. */
const smtp = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? 'no-reply@babaloocoffeeclub.com',
      defaultFromName: process.env.EMAIL_FROM_NAME ?? 'Babaloo Coffee Club',
      // Don't verify the SMTP login at boot: a wrong password must not take the whole CMS down,
      // it just fails (and is logged) when a notification is sent.
      skipVerify: true,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      },
    })
  : undefined;
const dbPush = process.env.DB_PUSH ? process.env.DB_PUSH === '1' : process.env.NODE_ENV !== 'production';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim().replace(/\/$/, '') || undefined,
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
  // Sidebar: Pages (globals + new pages) · Menu · Media · Messages · Settings.
  collections: withRowLabels([Pages, MenuItems, MenuCategories, MenuLabels, Media, FormSubmissions, Resumes, Users]),
  globals: withRowLabels(globals),
  // Image library folders (one per page/section); the folder collection is created by Payload.
  folders: { slug: 'folders', browseByFolder: true, collectionSpecific: false },
  i18n: {
    supportedLanguages: { en, es },
    fallbackLanguage: 'en',
    translations: {
      en: { general: { payloadSettings: 'Preferences' } },
      es: { general: { payloadSettings: 'Preferencias' } },
    },
  },
  endpoints: [formsSubmit, formsSubmitOptions, formsStatus, formsTest],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./babaloo.db', authToken: process.env.DATABASE_AUTH_TOKEN || undefined },
    push: dbPush,
    // Page sections are stored as one JSON column per page (far fewer tables and reads than one table per section type).
    blocksAsJSON: true,
  }),
  plugins: [
    s3Storage({
      enabled: Boolean(s3),
      bucket: s3?.bucket ?? '',
      config: s3?.config ?? {},
      collections: {
        // Photos at the bucket root with their original names (same keys as in Vercel Blob, and no
        // extra `prefix` column); served from the bucket's public URL.
        media: s3?.publicUrl ? { disablePayloadAccessControl: true, generateFileURL: ({ filename }) => `${s3.publicUrl}/${filename}` } : true,
        resumes: { prefix: 'resumes' },
      },
    }),
    vercelBlobStorage({
      enabled: Boolean(blobToken) && !s3,
      token: blobToken,
      // Public photos are served straight from the Blob CDN (no token needed to read them).
      collections: { media: { disablePayloadAccessControl: true } },
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    }),
    // Résumés: unguessable blob paths (the store itself is public).
    vercelBlobStorage({
      enabled: Boolean(blobToken) && !s3,
      token: blobToken,
      collections: { resumes: { prefix: 'resumes' } },
      addRandomSuffix: true,
      cacheControlMaxAge: 0,
    }),
  ],
  sharp,
  email: smtp,
  cors: siteUrls,
  csrf: siteUrls,
  upload: {
    limits: { fileSize: 12 * 1024 * 1024 },
  },
});
