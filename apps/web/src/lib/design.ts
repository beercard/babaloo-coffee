/**
 * Turns Settings > Design into CSS custom properties on :root. Only values that differ from the
 * original design are written, so an untouched Design page adds nothing to the HTML.
 */
import type { Design } from '@/lib/cms/types';

const FONTS = {
  lato: "'Lato', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  poppins: "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  jimmy: "'Jimmy Script', 'Mrs Saint Delafield', 'Brush Script MT', cursive",
  delafield: "'Mrs Saint Delafield', 'Brush Script MT', cursive",
};

const COLOR_VARS: Record<keyof Design['colors'], string[]> = {
  ink: ['--ink'],
  cream: ['--cream'],
  bark: ['--bark'],
  creamBright: ['--cream-bright'],
  sage: ['--sage'],
  concrete: ['--concrete', '--concrete-light'],
  wood: ['--wood-bg'],
  focus: ['--focus'],
};

const HEADER_SCALE = { s: 0.82, m: 1, l: 1.22 };

export function designStyle(design: Design): string {
  const vars: string[] = [];
  const set = (name: string, value: string | number) => vars.push(`${name}:${value}`);
  const ratio = (name: string, pct: number) => {
    if (Number.isFinite(pct) && pct !== 100) set(name, Math.round(pct) / 100);
  };

  for (const [key, names] of Object.entries(COLOR_VARS) as [keyof Design['colors'], string[]][]) {
    const v = design.colors[key];
    if (v) names.forEach((n) => set(n, v));
  }

  const t = design.type;
  if (t.bodyFont !== 'lato') set('--font-body', FONTS[t.bodyFont]);
  if (t.uiFont !== 'poppins') set('--font-ui', FONTS[t.uiFont]);
  if (t.scriptFont !== 'jimmy') set('--font-script', FONTS[t.scriptFont]);
  ratio('--text-scale', t.textScale);
  ratio('--title-scale', t.titleScale);
  ratio('--script-scale', t.scriptScale);
  ratio('--menu-scale', t.menuScale);
  ratio('--nav-scale', t.navScale);

  const l = design.layout;
  ratio('--space-scale', l.sectionSpacing);
  ratio('--side-scale', l.sideMargin);
  if (l.contentWidth && l.contentWidth !== 1200) set('--design-content-w', `${Math.round(l.contentWidth)}px`);
  if (l.titleAlign !== 'center') set('--title-align', l.titleAlign);

  const h = design.header;
  if (h.size !== 'm') set('--header-scale', HEADER_SCALE[h.size]);
  ratio('--logo-scale', h.logoScale);

  const f = design.footer;
  if (f.textColor) set('--footer-ink', f.textColor);
  if (f.background === 'color' && f.color) set('--footer-bg', f.color);

  // `html:root` outranks the `:root` tokens of the global stylesheet, whatever the order in <head>.
  return vars.length ? `html:root{${vars.join(';')}}` : '';
}
