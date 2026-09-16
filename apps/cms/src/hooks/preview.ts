/**
 * Preview site: a second build of the website that shows drafts (PAYLOAD_DRAFTS=1 on that
 * Vercel project). PREVIEW_URL enables the "Preview" button in the admin.
 */
export function previewUrl(path: string): string | undefined {
  const base = process.env.PREVIEW_URL?.trim().replace(/\/$/, '');
  if (!base) return undefined;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
