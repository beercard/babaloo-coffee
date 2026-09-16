/**
 * One-off upgrade to the "WordPress-like" CMS (history + drafts, JSON page sections, labels
 * collection, Forms and Design settings). Safe to run more than once.
 *
 *   1. Back up first:   node src/scripts/export.ts backup.json
 *   2. Dry run:         node src/scripts/migrate-cms.ts backup.json --dry
 *   3. Apply:           node src/scripts/migrate-cms.ts backup.json
 *
 * (run with NODE_OPTIONS="--import=tsx/esm", DB_PUSH=0 and DEPLOY_HOOK_URL= so nothing rebuilds midway)
 *
 * Steps: push the new schema (warnings are printed, never prompted), restore the page sections from
 * the backup (they move from one table per section type to one JSON column), mark every existing
 * document as published (creating its first history entry), turn the old fixed product tags into
 * editable labels, and fill the Forms / Design settings with the current fields and defaults.
 */
import 'dotenv/config';
import fs from 'fs';
import { getPayload } from 'payload';
import config from '../payload.config';
import { DEFAULT_FIELDS } from '../endpoints/formsSubmit';

type Json = Record<string, unknown>;
const [, , backupFile, flag] = process.argv;
if (!backupFile) throw new Error('Usage: migrate-cms.ts <backup.json> [--dry]');
const dry = flag === '--dry';
const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8')) as { globals: Record<string, Json>; collections: Record<string, Json[]> };

const payload = await getPayload({ config });
const log = (msg: string) => console.log(`[migrate] ${msg}`);

// ---------- 1. schema ----------
{
  const adapter = payload.db as unknown as {
    schema: unknown;
    drizzle: unknown;
    tables: Record<string, unknown>;
    execute: (args: { drizzle: unknown; raw: string }) => Promise<{ rows: Json[] }>;
    client: { migrate: (stmts: string[]) => Promise<unknown> };
    requireDrizzleKit: () => { pushSchema: (schema: unknown, db: unknown) => Promise<{ apply: () => Promise<void>; hasDataLoss: boolean; warnings: string[]; statementsToExecute?: string[] }> };
  };
  const run = (raw: string) => adapter.execute({ drizzle: adapter.drizzle, raw });

  // Tables the new schema no longer has. Only the old one-table-per-section storage of page
  // sections is expected here (its content is restored from the backup in step 2); anything else
  // stops the migration. Dropping them first keeps drizzle-kit from asking "renamed or created?".
  const existing = (await run("select name from sqlite_master where type='table' and name not like 'sqlite_%' and name not like '!_%' escape '!'")).rows.map((r) => String(r.name));
  const wanted = new Set(Object.keys(adapter.tables));
  const orphans = existing.filter((n) => !wanted.has(n));
  const unexpected = orphans.filter((n) => !/^(homepage|_homepage_v)_blocks_/.test(n));
  log(`schema: ${orphans.length} obsolete tables (${orphans.join(', ') || 'none'})`);
  if (unexpected.length) throw new Error(`Unexpected obsolete tables, stopping: ${unexpected.join(', ')}`);
  if (dry) {
    log('dry run: nothing changed');
    process.exit(0);
  }
  // `migrate` = one transaction with foreign keys off (no cascades while tables are rebuilt).
  if (orphans.length) {
    await adapter.client.migrate(orphans.map((name) => `DROP TABLE IF EXISTS "${name}"`));
    log(`dropped ${orphans.length} obsolete tables`);
  }

  const { pushSchema } = adapter.requireDrizzleKit();
  const result = await pushSchema(adapter.schema, adapter.drizzle);
  // drizzle-kit repeats CREATE INDEX for rebuilt tables and adds its own PRAGMAs: dedupe / drop them.
  const seen = new Set<string>();
  const statements = (result.statementsToExecute ?? [])
    .map((st) => st.trim().replace(/;+$/, ''))
    .filter((st) => st && !/^PRAGMA /i.test(st) && !(/^CREATE (UNIQUE )?INDEX/i.test(st) && seen.has(st)) && Boolean(seen.add(st)));
  // drizzle-kit also copies columns that the old table does not have yet when it rebuilds a table
  // (e.g. the new `_status`): keep only the columns that really exist.
  for (let i = 0; i < statements.length; i++) {
    const m = /^INSERT INTO `__new_(\w+)`\((.*?)\) SELECT (.*?) FROM `(\w+)`$/s.exec(statements[i]!);
    if (!m) continue;
    const have = new Set((await run(`PRAGMA table_info("${m[4]}")`)).rows.map((r) => String(r.name)));
    const cols = m[2]!.split(',').map((c) => c.trim()).filter((c) => have.has(c.replace(/"/g, '')));
    statements[i] = `INSERT INTO \`__new_${m[1]}\`(${cols.join(', ')}) SELECT ${cols.join(', ')} FROM \`${m[4]}\``;
  }
  log(`schema: ${statements.length} statements, data loss: ${result.hasDataLoss}`);
  for (const w of result.warnings) log(`  warning: ${w}`);
  if (process.env.MIGRATE_STATEMENTS) fs.writeFileSync(process.env.MIGRATE_STATEMENTS, statements.join(';\n'));
  if (process.env.MIGRATE_STOP_BEFORE_APPLY) process.exit(0);
  if (statements.length) {
    await adapter.client.migrate(statements);
    log('schema applied');
  }
}

const ctx = { context: { migration: true } };

// ---------- 2. page sections (globals) ----------
const sectionGlobals = ['homepage'] as const;
for (const slug of sectionGlobals) {
  const current = (await payload.findGlobal({ slug, depth: 0 })) as unknown as Json;
  const saved = backup.globals[slug]?.sections as Json[] | undefined;
  if ((!Array.isArray(current.sections) || current.sections.length === 0) && saved?.length) {
    await payload.updateGlobal({ slug, data: { sections: saved, _status: 'published' } as never, depth: 0, ...ctx });
    log(`${slug}: ${saved.length} sections restored`);
  }
}

// ---------- 3. labels ----------
const LABELS: { name: string; kind: 'badge' | 'location'; color?: string; order: number }[] = [
  { name: 'Signature', kind: 'badge', order: 1 },
  { name: 'Popular', kind: 'badge', order: 2 },
  { name: 'New', kind: 'badge', order: 3 },
  { name: 'Seasonal', kind: 'badge', order: 4 },
  { name: 'Vegan', kind: 'badge', order: 5 },
  { name: 'Gluten free', kind: 'badge', order: 6 },
  { name: 'Rea Farms', kind: 'location', color: '#5d6b3d', order: 10 },
  { name: 'South End', kind: 'location', color: '#8a4b2f', order: 11 },
  { name: 'Lake Norman', kind: 'location', color: '#3f6273', order: 12 },
];
const labelIds = new Map<string, number | string>();
for (const l of LABELS) {
  const found = await payload.find({ collection: 'menu-labels', where: { name: { equals: l.name } }, limit: 1, depth: 0 });
  const doc =
    found.docs[0] ??
    (await payload.create({ collection: 'menu-labels', data: { name: l.name, kind: l.kind, color: l.color, order: l.order, showBadge: true, _status: 'published' } as never, ...ctx }));
  labelIds.set(l.name, doc.id);
}
log(`labels: ${labelIds.size}`);

// ---------- 4. publish existing documents (creates their first history entry) + tags → labels ----------
for (const collection of ['menu-categories', 'menu-items', 'menu-labels', 'pages'] as const) {
  const { docs } = await payload.find({ collection, depth: 0, limit: 0, pagination: false, draft: false });
  let n = 0;
  for (const doc of docs as unknown as Json[]) {
    const versions = await payload.countVersions({ collection, where: { parent: { equals: doc.id } } });
    const data: Json = {};
    if (collection === 'menu-items') {
      const tags = (doc.tags as string[] | undefined) ?? [];
      const labels = (doc.labels as unknown[] | undefined) ?? [];
      if (tags.length && labels.length === 0) data.labels = tags.map((tg) => labelIds.get(tg)).filter(Boolean);
    }
    if (versions.totalDocs > 0 && doc._status === 'published' && Object.keys(data).length === 0) continue;
    await payload.update({ collection, id: doc.id as number, data: { ...data, _status: 'published' } as never, depth: 0, ...ctx });
    n++;
  }
  log(`${collection}: ${n} of ${docs.length} published`);
}

// ---------- 5. Forms settings ----------
{
  const forms = (await payload.findGlobal({ slug: 'forms', depth: 0 })) as unknown as Json;
  const about = (await payload.findGlobal({ slug: 'about-page', depth: 0 })) as unknown as Json;
  const join = (about.join ?? {}) as Json;
  const listFrom = (v: unknown, fallback: string[]) => {
    const list = Array.isArray(v) ? (v as Json[]).map((x) => String(x.label ?? '')).filter(Boolean) : [];
    return list.length ? list : fallback;
  };
  const toRows = (form: 'contact' | 'careers') =>
    DEFAULT_FIELDS[form].map((fd) => {
      const options =
        fd.name === 'position' ? listFrom(join.positions, fd.options) : fd.name === 'experience' ? listFrom(join.experienceLevels, fd.options) : fd.options;
      return {
        label: fd.label,
        type: fd.type,
        name: fd.name,
        required: fd.required,
        width: fd.type === 'textarea' ? 'full' : 'half',
        options: options.map((label) => ({ label })),
      };
    });
  const data: Json = { _status: 'published' };
  if (!((forms.contact as Json | undefined)?.fields as unknown[] | undefined)?.length) data.contact = { ...((forms.contact as Json) ?? {}), fields: toRows('contact') };
  if (!((forms.careers as Json | undefined)?.fields as unknown[] | undefined)?.length) data.careers = { ...((forms.careers as Json) ?? {}), fields: toRows('careers') };
  await payload.updateGlobal({ slug: 'forms', data: data as never, depth: 0, ...ctx });
  log(`forms: ${Object.keys(data).length - 1} forms filled`);
}

// ---------- 6. every other global: published + first history entry ----------
for (const g of payload.config.globals) {
  const slug = g.slug as 'design';
  const versions = await payload.countGlobalVersions({ global: slug });
  if (versions.totalDocs > 0) continue;
  await payload.updateGlobal({ slug, data: { _status: 'published' } as never, depth: 0, ...ctx });
  log(`${slug}: published`);
}

log('done');
process.exit(0);
