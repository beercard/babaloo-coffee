/**
 * Where the forms post to. The static site cannot receive POSTs, so the CMS
 * (or another endpoint) handles submissions.
 *
 *   PUBLIC_FORM_ENDPOINT  → used verbatim when set (Formspree, Zapier, n8n…)
 *   PUBLIC_CMS_URL        → `${PUBLIC_CMS_URL}/api/forms/submit` (Payload endpoint: stores the
 *                           message in the CMS and emails FORM_NOTIFY_EMAIL)
 *   neither               → FormSubmit relay: the message is emailed straight to the site's
 *                           contact address (the first submission triggers a one-time activation
 *                           email to that inbox). Set PUBLIC_FORM_RELAY=off to disable.
 */
export function getFormEndpoint(email?: string): string | undefined {
  const explicit = import.meta.env.PUBLIC_FORM_ENDPOINT;
  if (explicit) return explicit;
  const cms = import.meta.env.PUBLIC_CMS_URL ?? import.meta.env.PAYLOAD_URL;
  if (cms) return `${cms.replace(/\/$/, '')}/api/forms/submit`;
  if (email && import.meta.env.PUBLIC_FORM_RELAY !== 'off') return `https://formsubmit.co/ajax/${email}`;
  return undefined;
}
