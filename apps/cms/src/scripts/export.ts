/**
 * Backup: dumps every global and collection (depth 0) to a JSON file.
 *   npm run export --workspace apps/cms -- <out.json>
 */
import 'dotenv/config';
import fs from 'fs';
import { getPayload } from 'payload';
import config from '../payload.config';

const out = process.argv[2] ?? `backup-${Date.now()}.json`;
const payload = await getPayload({ config });
const dump: Record<string, unknown> = { exportedAt: new Date().toISOString(), globals: {}, collections: {} };
for (const g of payload.config.globals) {
  (dump.globals as Record<string, unknown>)[g.slug] = await payload.findGlobal({ slug: g.slug as never, depth: 0 });
}
for (const c of payload.config.collections) {
  if (c.slug.startsWith('payload-')) continue;
  const { docs } = await payload.find({ collection: c.slug as never, depth: 0, limit: 0, pagination: false });
  (dump.collections as Record<string, unknown>)[c.slug] = docs;
}
fs.writeFileSync(out, JSON.stringify(dump, null, 2));
console.log(`[export] ${out}`);
process.exit(0);
