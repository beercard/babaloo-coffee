// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = env.SITE_URL || 'https://babaloocoffeeclub.com';
const cmsUrl = env.PAYLOAD_URL || env.PUBLIC_CMS_URL || '';

/** Hosts allowed as remote image sources (the CMS media host). */
const remotePatterns = cmsUrl
  ? [{ protocol: new URL(cmsUrl).protocol.replace(':', ''), hostname: new URL(cmsUrl).hostname }]
  : [];

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
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
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: { enabled: false },
});
