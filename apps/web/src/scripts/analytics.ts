/**
 * GA4 event tracking. Page views come from gtag's config plus GA4 enhanced measurement
 * (history changes cover the client-side navigation of Astro's ClientRouter).
 *
 * Events (all sent with page_path):
 *   generate_lead / form_submit / form_error / file_attach  — Contact and Join our team forms
 *   order_online_click, click_phone, click_email, click_map, social_click, outbound_click
 *   cta_click, nav_open, nav_click, footer_click
 *   menu_category_open, menu_section_open, select_item, menu_location_filter
 *   carousel_navigate, scroll_depth (25/50/75/100)
 */
type Params = Record<string, string | number | boolean | undefined>;
type Gtag = (command: 'event', name: string, params?: Params) => void;

const w = window as unknown as { gtag?: Gtag; __bbAnalytics?: boolean };

export function track(name: string, params: Params = {}): void {
  if (typeof w.gtag !== 'function') return;
  w.gtag('event', name, { page_path: location.pathname, ...params });
}

const text = (el: Node | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);

function onClick(event: MouseEvent): void {
  const target = event.target as Element | null;
  if (!target) return;

  // ---------- menu ----------
  const item = target.closest<HTMLElement>('[data-board-item]');
  if (item) {
    const li = item.closest('.board__item');
    const cat = item.closest('[data-board-cat]');
    const sub = item.closest('[data-board-sub]');
    track('select_item', {
      item_name: text(li?.querySelector('.board__item-name')?.firstChild ?? item),
      item_category: text(cat?.querySelector('.board__cat-name')),
      item_category2: text(sub?.querySelector('.board__sub-label')) || undefined,
      price: text(li?.querySelector('.board__price')) || undefined,
    });
    return;
  }
  const summary = target.closest('summary');
  if (summary) {
    const details = summary.parentElement as HTMLDetailsElement | null;
    // `open` still has the value from before the click.
    if (details && !details.open) {
      if (details.matches('[data-board-cat]')) track('menu_category_open', { category: text(summary.querySelector('.board__cat-name')) });
      else if (details.matches('[data-board-sub]')) track('menu_section_open', { section: text(summary.querySelector('.board__sub-label')), category: text(details.closest('[data-board-cat]')?.querySelector('.board__cat-name')) });
    }
    return;
  }
  const locationBtn = target.closest<HTMLElement>('[data-board-filter] [data-location]');
  if (locationBtn) {
    track('menu_location_filter', { location: locationBtn.dataset.location || 'all', label: text(locationBtn) });
    return;
  }

  // ---------- navigation ----------
  if (target.closest('[data-nav-toggle]')) {
    track('nav_open');
    return;
  }
  if (target.closest('[data-prev], [data-next], [data-dot]')) {
    track('carousel_navigate', { control: target.closest('[data-prev]') ? 'prev' : target.closest('[data-next]') ? 'next' : 'dot' });
    return;
  }

  const link = target.closest<HTMLAnchorElement>('a[href]');
  if (!link) return;
  const href = link.getAttribute('href') ?? '';
  const label = text(link) || link.getAttribute('aria-label') || '';
  const area = link.closest('.site-nav') ? 'menu' : link.closest('footer') ? 'footer' : link.closest('.nav-row') ? 'links_row' : link.closest('header') ? 'header' : 'content';

  if (href.startsWith('tel:')) return track('click_phone', { link_text: label, area });
  if (href.startsWith('mailto:')) return track('click_email', { link_text: label, area });
  if (/toasttab\.com|order\./i.test(href)) return track('order_online_click', { link_url: href, link_text: label, area });
  if (/google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple/i.test(href)) return track('click_map', { link_url: href, link_text: label, area });
  if (/instagram|facebook|tiktok|twitter|x\.com|youtube|wa\.me|whatsapp/i.test(href)) return track('social_click', { link_url: href, network: new URL(href, location.href).hostname.replace(/^www\./, ''), area });

  if (area === 'menu') track('nav_click', { link_text: label, link_url: href });
  else if (area === 'footer') track('footer_click', { link_text: label, link_url: href });
  else if (area === 'links_row') track('nav_click', { link_text: label, link_url: href, area });
  if (link.classList.contains('btn')) track('cta_click', { link_text: label, link_url: href, area });

  const url = new URL(href, location.href);
  if (url.origin !== location.origin && area !== 'menu' && area !== 'footer') track('outbound_click', { link_url: url.href, link_text: label, area });
}

function onForm(event: Event): void {
  const { form, status, message } = (event as CustomEvent<{ form: string; status: 'success' | 'error'; message?: string }>).detail;
  if (status === 'success') {
    track('form_submit', { form_name: form });
    track('generate_lead', { form_name: form, lead_type: form === 'careers' ? 'job_application' : 'contact' });
  } else {
    track('form_error', { form_name: form, error_message: (message ?? '').slice(0, 100) });
  }
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement | null;
  if (input?.matches('input[type="file"][data-file]') && input.files?.length) {
    track('file_attach', { form_name: input.closest<HTMLFormElement>('form')?.dataset.form, file_type: input.files[0]!.type });
  }
}

let sent = new Set<number>();
let ticking = false;
function onScroll(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    const pct = (scrollY / max) * 100;
    for (const mark of [25, 50, 75, 100]) {
      if (pct >= mark - 1 && !sent.has(mark)) {
        sent.add(mark);
        track('scroll_depth', { percent_scrolled: mark });
      }
    }
  });
}

export function initAnalytics(): void {
  sent = new Set();
  if (w.__bbAnalytics) return;
  w.__bbAnalytics = true;
  document.addEventListener('click', onClick, { capture: true, passive: true });
  document.addEventListener('change', onFileChange, { capture: true, passive: true });
  document.addEventListener('babaloo:form', onForm);
  addEventListener('scroll', onScroll, { passive: true });
}
