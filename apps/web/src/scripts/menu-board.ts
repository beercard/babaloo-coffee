/**
 * Menu board behaviour:
 *  - clicking a product swaps the photo in the panel;
 *  - opening a category shows its photo and switches the panel tone;
 *  - only one top-level category stays open at a time (like the artboard);
 *  - deep links (/menu#latte) open the right category and select the item.
 */
export function initMenuBoard(): void {
  const board = document.querySelector<HTMLElement>('[data-board]');
  if (!board) return;
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

  const select = (btn: HTMLButtonElement) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    show(btn.dataset.visual);
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => select(btn)));

  cats.forEach((cat) => {
    cat.addEventListener('toggle', () => {
      if (!cat.open) return;
      // Accordion: close siblings.
      cats.forEach((other) => other !== cat && other.open && (other.open = false));
      if (panel) panel.dataset.tone = cat.dataset.tone ?? '0';
      const pressed = cat.querySelector<HTMLButtonElement>('[data-board-item][aria-pressed="true"]');
      show(pressed?.dataset.visual ?? cat.dataset.visual);
    });
  });

  board.querySelectorAll<HTMLDetailsElement>('[data-board-sub]').forEach((sub) => {
    sub.addEventListener('toggle', () => {
      if (sub.open && sub.dataset.visual) show(sub.dataset.visual);
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
