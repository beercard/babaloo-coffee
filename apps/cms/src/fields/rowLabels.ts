/**
 * Gives every array row and page section a readable title in the admin (see components/RowLabels).
 * Applied once to the whole config, so new arrays get it automatically.
 */
import type { Block, CollectionConfig, Field, GlobalConfig } from 'payload';

type AnyField = Field & { name?: string; type: string; fields?: Field[]; tabs?: { fields: Field[] }[]; blocks?: Block[]; admin?: Record<string, unknown> };

const names = (fields: Field[] = []): string[] =>
  fields.flatMap((f) => {
    const a = f as AnyField;
    if (a.type === 'row' || a.type === 'collapsible') return names(a.fields);
    return a.name ? [a.name] : [];
  });

function rowLabelFor(sub: string[]) {
  const has = (n: string) => sub.includes(n);
  const path = '/components/RowLabels#RowLabel';
  if (has('type') && has('required') && has('label')) return { path, clientProps: { fields: ['label'], kind: 'formField', fallback: ['Field', 'Campo'] } };
  if (has('href')) return { path, clientProps: { fields: ['label'], kind: 'link', fallback: ['Link', 'Enlace'] } };
  if (has('status') && has('name')) return { path, clientProps: { fields: ['name'], kind: 'location', fallback: ['Location', 'Local'] } };
  if (has('days')) return { path, clientProps: { fields: ['days'], kind: 'hours', fallback: ['Line', 'Línea'] } };
  if (has('dayOfWeek')) return { path, clientProps: { fields: ['opens'], fallback: ['Rule', 'Regla'] } };
  if (has('author')) return { path, clientProps: { fields: ['author', 'quote'], fallback: ['Quote', 'Frase'] } };
  if (has('platform')) return { path, clientProps: { fields: ['label', 'platform', 'url'], fallback: ['Profile', 'Perfil'] } };
  if (has('more')) return { path, clientProps: { fields: ['label'], fallback: ['Frame', 'Marco'] } };
  if (has('slides') || has('imageMobile')) return { path, clientProps: { fields: ['title', 'subtitle'], fallback: ['Photo', 'Foto'] } };
  if (has('caption')) return { path, clientProps: { fields: ['caption'], fallback: ['Photo', 'Foto'] } };
  if (has('image') && sub.length === 1) return { path, clientProps: { fields: [], fallback: ['Image', 'Imagen'] } };
  return { path, clientProps: { fields: ['label', 'name', 'title'], fallback: ['Item', 'Elemento'] } };
}

const labelledBlocks = new WeakSet<Block>();

function walk(fields: Field[] = []): void {
  for (const f of fields as AnyField[]) {
    if (f.type === 'array') {
      const admin = (f.admin ??= {}) as { components?: Record<string, unknown> };
      admin.components ??= {};
      admin.components.RowLabel ??= rowLabelFor(names(f.fields));
    }
    if (f.type === 'blocks') {
      for (const b of f.blocks ?? []) {
        if (labelledBlocks.has(b)) continue;
        labelledBlocks.add(b);
        const admin = ((b as { admin?: Record<string, unknown> }).admin ??= {}) as { components?: Record<string, unknown>; disableBlockName?: boolean };
        admin.disableBlockName = true;
        admin.components ??= {};
        admin.components.Label ??= '/components/RowLabels#BlockLabel';
        walk(b.fields);
      }
    }
    if (f.fields) walk(f.fields);
    if (f.tabs) f.tabs.forEach((tab) => walk(tab.fields));
  }
}

export function withRowLabels<T extends CollectionConfig | GlobalConfig>(configs: T[]): T[] {
  configs.forEach((c) => walk(c.fields));
  return configs;
}
