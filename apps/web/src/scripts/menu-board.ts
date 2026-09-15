/**
 * Menu board behaviour:
 *  - clicking a product swaps the photo in the panel;
 *  - opening a category shows its photo and switches the panel tone;
 *  - only one top-level category stays open at a time (like the artboard);
 *  - deep links (/menu#latte) open the right category and select the item.
 */
export function initMenuBoard(): void {
  const board = document.querySelector<HTMLElement>('[data-board]');
  if (!board || board.dataset.bound) return;
  board.dataset.bound = 'true';
  const panel = board.querySelector<HTMLElement>('[data-board-visual]');
  const figures = new Map<string, HTMLElement>();
  board.querySelectorAll<HTMLElement>('[data-board-image]').forEach((f) => figures.set(f.dataset.boardImage ?? '', f));
  const cats = Array.from(board.querySelectorAll<HTMLDetailsElement>('[data-board-cat]'));
  const buttons = Array.from(board.querySelectorAll<HTMLButtonElement>('[data-board-item]'));
  let active = board.querySelector<HTMLElement>('[data-board-image].is-active')?.dataset.boardImage;

  const show = (id?: string) => {
    if (!id || id === active || !figures.has(id)) return;
    const prev = active ? figures.get(active) : undefined;
    const next = figures.get(id)!;
    next.hidden = false;
    // Wait a frame so the opacity transition runs.
    requestAnimationFrame(() => {
      next.classList.add('is-active');
      prev?.classList.remove('is-active');
      if (prev) window.setTimeout(() => (prev.hidden = true), 520);
    });
    active = id;
  };

  /** Steam only rises over hot drinks. */
  const setHot = (el: Element | null) => {
    if (panel) panel.dataset.hot = String(el?.closest<HTMLElement>('[data-kind]')?.dataset.kind === 'hot');
  };
  const select = (btn: HTMLButtonElement) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    show(btn.dataset.visual);
    setHot(btn);
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => select(btn)));

  // Accordion: opening a category closes the others. Closing a taller one above shifts the page
  // up, so compensate the scroll and keep the clicked heading exactly where the visitor saw it.
  cats.forEach((cat) => {
    const summary = cat.querySelector<HTMLElement>(':scope > summary');
    summary?.addEventListener('click', () => {
      if (cat.open) return;
      const top = summary.getBoundingClientRect().top;
      cats.forEach((other) => other !== cat && other.open && (other.open = false));
      // Measure again once this category has opened (the list may re-align), then correct the scroll.
      const fix = () => {
        const delta = summary.getBoundingClientRect().top - top;
        if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior });
      };
      fix();
      window.setTimeout(fix, 0);
    });
  });

  // Smooth open / close: animate the panel height with the Web Animations API
  // (details has no native transition). Closing waits for the animation.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = 380;
  const animating = new WeakSet<HTMLDetailsElement>();
  board.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => {
    const summary = d.querySelector<HTMLElement>(':scope > summary');
    const panel = d.querySelector<HTMLElement>(':scope > [data-board-panel]');
    if (!summary || !panel || reduced) return;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (animating.has(d)) return;
      animating.add(d);
      if (d.open) {
        const h = panel.offsetHeight;
        const anim = panel.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: DUR, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        anim.onfinish = () => {
          d.open = false;
          animating.delete(d);
        };
      } else {
        d.open = true;
        const h = panel.offsetHeight;
        const anim = panel.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: DUR, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        anim.onfinish = () => animating.delete(d);
      }
    });
  });

  cats.forEach((cat) => {
    cat.addEventListener('toggle', () => {
      if (!cat.open) return;
      // Accordion (deep links, keyboard): close siblings.
      cats.forEach((other) => other !== cat && other.open && (other.open = false));
      if (panel) panel.dataset.tone = cat.dataset.tone ?? '0';
      const pressed = cat.querySelector<HTMLButtonElement>('[data-board-item][aria-pressed="true"]');
      show(pressed?.dataset.visual ?? cat.dataset.visual);
    });
  });

  board.querySelectorAll<HTMLDetailsElement>('[data-board-sub]').forEach((sub) => {
    sub.addEventListener('toggle', () => {
      if (!sub.open) return;
      if (sub.dataset.visual) show(sub.dataset.visual);
      setHot(sub);
    });
  });

  // Deep link support.
  const openHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target || !board.contains(target)) return;
    const details = target.closest('details') ?? (target as HTMLElement);
    let el: HTMLElement | null = details;
    while (el && board.contains(el)) {
      if (el instanceof HTMLDetailsElement) el.open = true;
      el = el.parentElement?.closest('details') ?? null;
    }
    const btn = target.querySelector<HTMLButtonElement>('[data-board-item]');
    if (btn) select(btn);
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  window.addEventListener('hashchange', openHash);
  if (location.hash) window.setTimeout(openHash, 50);
}
