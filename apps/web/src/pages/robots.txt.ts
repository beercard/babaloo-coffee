import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  // The preview site (drafts) must stay out of search engines.
  if (import.meta.env.PAYLOAD_DRAFTS === '1') {
    return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const base = site?.href ?? 'https://babaloocoffeeclub.com/';
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${base}sitemap-index.xml`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
