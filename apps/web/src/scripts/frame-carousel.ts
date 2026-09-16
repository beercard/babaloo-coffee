/**
 * Carousels inside the gold frames: swipe (native scroll-snap), arrows, dots and optional
 * autoplay (paused on hover, focus, touch, hidden tab and reduced motion).
 */
export function initFrameCarousels(): void {
  document.querySelectorAll<HTMLElement>('[data-frame-carousel]').forEach((root) => {
    if (root.dataset.bound) return;
    root.dataset.bound = 'true';
    const track = root.querySelector<HTMLElement>('[data-track]');
    if (!track) return;
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot]'));
    const count = track.children.length;
    let index = 0;

    const go = (i: number) => {
      index = (i + count) % count;
      track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
    };
    const sync = () => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i === index && dots[i]?.getAttribute('aria-current') === 'true') return;
      index = Math.min(count - 1, Math.max(0, i));
      dots.forEach((d, k) => (k === index ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    };

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });
    root.querySelector('[data-prev]')?.addEventListener('click', () => go(index - 1));
    root.querySelector('[data-next]')?.addEventListener('click', () => go(index + 1));
    dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.dot))));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(index - 1);
      }
    });
    // Keep the current photo aligned when the frame changes size.
    new ResizeObserver(() => track.scrollTo({ left: index * track.clientWidth })).observe(track);

    if (root.dataset.autoplay === undefined || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let paused = false;
    const pause = () => (paused = true);
    const resume = () => (paused = false);
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', resume);
    track.addEventListener('touchstart', pause, { passive: true });
    let visible = false;
    new IntersectionObserver(([entry]) => (visible = Boolean(entry?.isIntersecting))).observe(root);
    const timer = window.setInterval(() => {
      if (!root.isConnected) return window.clearInterval(timer);
      if (!paused && visible && !document.hidden) go(index + 1);
    }, 4500);
  });
}
