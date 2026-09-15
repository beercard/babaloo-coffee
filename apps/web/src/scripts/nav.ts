/** Full-screen navigation overlay: toggle, Escape to close, focus handling. */
export function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!toggle || !nav) return;
  const close = nav.querySelector<HTMLButtonElement>('[data-nav-close]');

  const open = () => {
    nav.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
    (nav.querySelector<HTMLElement>('a, button') ?? nav).focus();
  };
  const shut = (restoreFocus = true) => {
    nav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => (nav.hidden ? open() : shut()));
  close?.addEventListener('click', () => shut());
  nav.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    if (link) shut(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !nav.hidden) shut();
  });
}
