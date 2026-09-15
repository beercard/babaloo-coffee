/**
 * Hero carousel ("fotos que cambien"): autoplay crossfade only.
 * JS only flips classes; the fade is CSS. Deferred photos (in <template>)
 * are inserted shortly after page load. Autoplay pauses while the tab is
 * hidden and is disabled under prefers-reduced-motion.
 */
export function initHero(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || hero.dataset.bound) return;
  hero.dataset.bound = 'true';
  const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-slide]'));
  if (slides.length < 2) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const interval = Math.max(2500, Number(hero.dataset.interval) || 5000);
  let index = 0;
  let timer: number | undefined;

  const hydrate = () => {
    slides.forEach((s) => {
      const tpl = s.querySelector<HTMLTemplateElement>('template[data-slide-picture]');
      if (tpl) {
        s.appendChild(tpl.content.cloneNode(true));
        tpl.remove();
      }
    });
  };

  const show = (next: number) => {
    const n = (next + slides.length) % slides.length;
    if (n === index) return;
    slides[index]?.classList.remove('is-active');
    slides[index]?.setAttribute('aria-hidden', 'true');
    index = n;
    slides[index]?.classList.add('is-active');
    slides[index]?.removeAttribute('aria-hidden');
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
