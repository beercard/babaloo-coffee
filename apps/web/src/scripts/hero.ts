/**
 * Hero carousel ("fotos que cambien"): autoplay crossfade + arrows + dots.
 * JS only flips classes; the fade is CSS. Deferred photos (in <template>)
 * are inserted after page load, or immediately on the first interaction.
 * Autoplay pauses while the tab is hidden, while hovering/focusing the
 * controls, and is disabled under prefers-reduced-motion.
 */
export function initHero(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || hero.dataset.bound) return;
  hero.dataset.bound = 'true';
  const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-slide]'));
  if (slides.length < 2) return;

  const controls = hero.querySelector<HTMLElement>('[data-hero-controls]');
  const dots = Array.from(hero.querySelectorAll<HTMLButtonElement>('[data-hero-dot]'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interval = Math.max(2500, Number(hero.dataset.interval) || 5000);
  let index = 0;
  let timer: number | undefined;
  let hydrated = false;

  const hydrate = () => {
    if (hydrated) return;
    hydrated = true;
    slides.forEach((s) => {
      const tpl = s.querySelector<HTMLTemplateElement>('template[data-slide-picture]');
      if (tpl) {
        s.appendChild(tpl.content.cloneNode(true));
        tpl.remove();
      }
    });
  };

  const show = (next: number) => {
    hydrate();
    const n = (next + slides.length) % slides.length;
    if (n === index) return;
    slides[index]?.classList.remove('is-active');
    slides[index]?.setAttribute('aria-hidden', 'true');
    dots[index]?.classList.remove('is-active');
    dots[index]?.setAttribute('aria-selected', 'false');
    index = n;
    slides[index]?.classList.add('is-active');
    slides[index]?.removeAttribute('aria-hidden');
    dots[index]?.classList.add('is-active');
    dots[index]?.setAttribute('aria-selected', 'true');
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = undefined;
  };
  const start = () => {
    stop();
    if (reduced) return;
    timer = window.setInterval(() => show(index + 1), interval);
  };
  /** Restart the timer after a manual change so the next auto-advance is a full interval away. */
  const manual = (next: number) => {
    show(next);
    start();
  };

  if (controls) {
    controls.hidden = false;
    controls.querySelector('[data-hero-prev]')?.addEventListener('click', () => manual(index - 1));
    controls.querySelector('[data-hero-next]')?.addEventListener('click', () => manual(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => manual(i)));
    controls.addEventListener('mouseenter', stop);
    controls.addEventListener('mouseleave', start);
    controls.addEventListener('focusin', stop);
    controls.addEventListener('focusout', start);
  }
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') manual(index - 1);
    if (e.key === 'ArrowRight') manual(index + 1);
  });

  // Touch swipe.
  let startX = 0;
  hero.addEventListener('touchstart', (e) => (startX = e.touches[0]?.clientX ?? 0), { passive: true });
  hero.addEventListener(
    'touchend',
    (e) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - startX;
      if (Math.abs(dx) > 40) manual(dx < 0 ? index + 1 : index - 1);
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  // Stop the timer when navigating away (client-side navigation keeps this module alive).
  document.addEventListener('astro:before-swap', stop, { once: true });

  const boot = () => {
    hydrate();
    start();
  };
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', () => window.setTimeout(boot, 800), { once: true });
}
