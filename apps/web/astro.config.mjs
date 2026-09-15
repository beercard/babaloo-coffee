// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = env.SITE_URL || 'https://babaloocoffeeclub.com';
const cmsUrl = env.PAYLOAD_URL || env.PUBLIC_CMS_URL || '';

/** Hosts allowed as remote image sources (the CMS media host). */
const remotePatterns = [
  ...(cmsUrl ? [{ protocol: new URL(cmsUrl).protocol.replace(':', ''), hostname: new URL(cmsUrl).hostname }] : []),
  // CMS on Vercel: uploads are served from Vercel Blob.
  { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
];

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  // Optimised images are cached here between builds (Vercel / Actions restore node_modules).
  cacheDir: './node_modules/.astro',
  trailingSlash: 'never',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  image: {
    remotePatterns,
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  // Legacy WordPress URLs. These also live in public/.htaccess (Hostinger/Apache),
  // public/_redirects (Netlify/Cloudflare) and vercel.json so real 301s are served.
  redirects: {
    '/drinks': '/menu',
    '/food': '/menu#food-and-sweets',
    '/hours': '/#locations',
    '/contact-us': '/contact',
    '/gallery': '/',
    '/join-our-team': '/about#join-our-team',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: { enabled: false },
});
