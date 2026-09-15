/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Canonical production URL, e.g. https://babaloocoffeeclub.com */
  readonly SITE_URL?: string;
  /** Payload CMS base URL used at build time. When empty the local seed content is used. */
  readonly PAYLOAD_URL?: string;
  /** Optional API key (users collection) for private/draft content. */
  readonly PAYLOAD_API_KEY?: string;
  /** Public CMS URL used by the browser for form submissions. */
  readonly PUBLIC_CMS_URL?: string;
  /** Overrides the form endpoint entirely (e.g. a Formspree/Zapier URL). */
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_META_PIXEL_ID?: string;
  readonly PUBLIC_GADS_ID?: string;
  readonly PUBLIC_GADS_CONVERSION_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
