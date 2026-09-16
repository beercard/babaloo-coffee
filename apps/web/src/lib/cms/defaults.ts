/**
 * Defaults for the site-wide settings that editors may leave empty (Settings > Design and
 * Settings > Forms). They reproduce the original design, so an empty CMS field never changes
 * the look. Mirrors apps/cms (DEFAULT_FIELDS in endpoints/formsSubmit.ts).
 */
import type { Design, FormConfig, FormFieldConfig, FormsConfig } from './types';

export const DEFAULT_DESIGN: Design = {
  colors: {},
  type: { bodyFont: 'lato', uiFont: 'poppins', scriptFont: 'jimmy', textScale: 100, titleScale: 100, scriptScale: 100, menuScale: 100, navScale: 100 },
  layout: { sectionSpacing: 100, sideMargin: 100, contentWidth: 1200, titleAlign: 'center', animations: true },
  header: { size: 'm', logoScale: 100, sticky: true, showCurtain: true },
  footer: { background: 'texture', showDogs: true },
};

const field = (name: string, label: string, type: FormFieldConfig['type'], required: boolean, width: FormFieldConfig['width'] = 'half', options: string[] = []): FormFieldConfig => ({
  name,
  label,
  type,
  required,
  width,
  options,
});

export const DEFAULT_POSITIONS = ['Barista', 'Shift lead', 'Kitchen', 'Front of house', 'Other'];
export const DEFAULT_EXPERIENCE = ['No experience', 'Less than 1 year', '1-3 years', '3+ years'];

export const DEFAULT_FORMS: FormsConfig = {
  contact: {
    fields: [field('name', 'Name', 'text', false), field('email', 'Email', 'email', true), field('message', 'comment', 'textarea', false, 'full')],
    submitLabel: 'send',
    successMessage: 'Thank you! Your message is on its way.',
    subject: 'Website contact',
  },
  careers: {
    fields: [
      field('firstName', 'Name', 'text', true),
      field('lastName', 'Last', 'text', true),
      field('email', 'Email', 'email', true),
      field('phone', 'Phone', 'tel', true),
      field('position', 'Position', 'select', true, 'half', DEFAULT_POSITIONS),
      field('experience', 'Experience', 'select', true, 'half', DEFAULT_EXPERIENCE),
      field('resume', 'upload résumé', 'file', false),
    ],
    submitLabel: 'send',
    successMessage: "Thank you! We'll be in touch soon.",
    subject: 'Job application',
  },
};

/** Fills the gaps of a partially configured form with the defaults. */
export function withFormDefaults(form: 'contact' | 'careers', partial: Partial<FormConfig> | undefined): FormConfig {
  const d = DEFAULT_FORMS[form];
  return {
    fields: partial?.fields?.length ? partial.fields : d.fields,
    submitLabel: partial?.submitLabel || d.submitLabel,
    successMessage: partial?.successMessage || d.successMessage,
    subject: partial?.subject || d.subject,
  };
}
