/**
 * Where the forms post to. The static site cannot receive POSTs, so the CMS
 * (or any other endpoint) handles submissions.
 *
 *   PUBLIC_FORM_ENDPOINT  → used verbatim when set (Formspree, Zapier, n8n…)
 *   PUBLIC_CMS_URL        → `${PUBLIC_CMS_URL}/api/forms/submit` (Payload endpoint)
 *   neither               → forms render a mailto fallback
 */
export function getFormEndpoint(): string | undefined {
  const explicit = import.meta.env.PUBLIC_FORM_ENDPOINT;
  if (explicit) return explicit;
  const cms = import.meta.env.PUBLIC_CMS_URL ?? import.meta.env.PAYLOAD_URL;
  if (cms) return `${cms.replace(/\/$/, '')}/api/forms/submit`;
  return undefined;
}
