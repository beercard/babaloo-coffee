/**
 * Progressive enhancement for the forms: client-side validation messages,
 * loading / success / error states, JSON POST to the configured endpoint
 * (multipart when a résumé is attached). Without JS the form still submits
 * as a regular POST.
 */
const RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

/** Validates the optional file picker and mirrors the chosen file name next to the button. */
function checkFile(input: HTMLInputElement): boolean {
  const wrapper = input.closest<HTMLElement>('[data-upload]');
  const name = wrapper?.querySelector<HTMLElement>('[data-file-name]');
  const error = wrapper?.querySelector<HTMLElement>('[data-error]');
  const file = input.files?.[0];
  const max = Number(input.dataset.maxBytes) || 5 * 1024 * 1024;
  let message = '';
  if (file && !RESUME_TYPES.includes(file.type)) message = 'Please attach a PDF or Word document.';
  else if (file && file.size > max) message = `The file is too large (${Math.round(max / 1024 / 1024)} MB max).`;
  if (name) {
    name.textContent = file && !message ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : name.dataset.idle || 'PDF or Word · up to 5 MB';
    name.toggleAttribute('data-has-file', Boolean(file && !message));
  }
  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (message) input.value = '';
  return !message;
}
type FormState = 'idle' | 'loading' | 'success' | 'error';

function setState(form: HTMLFormElement, state: FormState, message?: string) {
  form.dataset.state = state;
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  if (submit) {
    submit.disabled = state === 'loading';
    submit.setAttribute('aria-disabled', String(state === 'loading'));
    const label = submit.dataset[state === 'success' ? 'labelSuccess' : state === 'loading' ? 'labelLoading' : 'labelIdle'];
    if (label) submit.textContent = label;
  }
  if (status) {
    status.textContent = message ?? '';
    status.hidden = !message;
    status.dataset.tone = state;
  }
}

function validate(form: HTMLFormElement): boolean {
  let ok = true;
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[name]:not([type="file"])').forEach((field) => {
    const wrapper = field.closest<HTMLElement>('[data-field]');
    const error = wrapper?.querySelector<HTMLElement>('[data-error]');
    field.setCustomValidity('');
    const valid = field.checkValidity();
    if (!valid) ok = false;
    field.setAttribute('aria-invalid', String(!valid));
    if (error) {
      error.textContent = valid ? '' : field.validationMessage || wrapper?.dataset.errorMessage || 'Please check this field.';
      error.hidden = valid;
    }
  });
  if (!ok) form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  return ok;
}

export function initForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = 'true';
    const endpoint = form.dataset.endpoint;
    const startedAt = Date.now();
    form.setAttribute('novalidate', '');

    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"][data-file]');
    if (fileInput) {
      const name = form.querySelector<HTMLElement>('[data-file-name]');
      if (name) name.dataset.idle = name.textContent ?? '';
      fileInput.addEventListener('change', () => checkFile(fileInput));
    }

    form.querySelectorAll<HTMLInputElement>('[name]:not([type="file"])').forEach((field) => {
      field.addEventListener('blur', () => {
        if (field.value) {
          const valid = field.checkValidity();
          field.setAttribute('aria-invalid', String(!valid));
          const error = field.closest('[data-field]')?.querySelector<HTMLElement>('[data-error]');
          if (error) {
            error.textContent = valid ? '' : field.validationMessage;
            error.hidden = valid;
          }
        }
      });
    });

    form.addEventListener('submit', async (event) => {
      if (!endpoint) return; // let the mailto/native action happen
      event.preventDefault();
      if (!validate(form)) return;
      if (fileInput && !checkFile(fileInput)) return;
      const file = fileInput?.files?.[0];

      const data = new FormData(form);
      const payload: Record<string, string> = {};
      data.forEach((value, key) => {
        if (typeof value === 'string') payload[key] = value;
      });
      payload.form = form.dataset.form ?? 'contact';
      payload.elapsed = String(Date.now() - startedAt);
      payload.page = location.pathname;
      const relay = endpoint.includes('formsubmit.co/');
      if (relay) {
        // Email relay: honeypot + subject in the relay's own vocabulary, no bookkeeping fields.
        if (payload.website) return; // bot
        delete payload.website;
        delete payload.elapsed;
        payload._honey = '';
        payload._subject = form.dataset.subject ?? '[Babaloo] Website contact';
        payload._template = 'table';
      }

      // With a file: multipart (CMS stores it; the email relay attaches it). Otherwise JSON.
      let reqBody: BodyInit = JSON.stringify(payload);
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (file) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        fd.append(relay ? 'attachment' : 'resume', file, file.name);
        reqBody = fd;
      } else {
        headers['Content-Type'] = 'application/json';
      }

      setState(form, 'loading');
      try {
        const res = await fetch(endpoint, { method: 'POST', headers, body: reqBody });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean; success?: string | boolean; message?: string; errors?: Record<string, string> };
        if (!res.ok || body.ok === false || body.success === false || body.success === 'false') {
          if (body.errors) {
            Object.entries(body.errors).forEach(([name, msg]) => {
              const field = form.querySelector<HTMLElement>(`[name="${name}"]`);
              const error = field?.closest('[data-field]')?.querySelector<HTMLElement>('[data-error]');
              field?.setAttribute('aria-invalid', 'true');
              if (error) {
                error.textContent = msg;
                error.hidden = false;
              }
            });
          }
          throw new Error(body.message || 'Something went wrong. Please try again or email us.');
        }
        form.reset();
        if (fileInput) checkFile(fileInput);
        setState(form, 'success', (relay ? form.dataset.successMessage : body.message) || form.dataset.successMessage || body.message || 'Thank you! We received your message.');
      } catch (err) {
        setState(form, 'error', (err as Error).message);
      }
    });
  });
}
