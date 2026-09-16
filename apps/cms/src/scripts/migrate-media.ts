/**
 * Moves every photo to the storage configured in the environment (S3/R2 via S3_*, or the disk via
 * MEDIA_DIR), keeping each image's id so pages and products stay linked.
 *
 * The files are downloaded from the URLs recorded in a backup made with the previous storage:
 *   node src/scripts/export.ts backup.json          # while the old storage is still configured
 *   node src/scripts/migrate-media.ts backup.json   # with the NEW storage configured (no BLOB token)
 *
 * (NODE_OPTIONS="--import=tsx/esm", DB_PUSH=0, DEPLOY_HOOK_URL= ; add --dry to only list the files)
 */
import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getPayload } from 'payload';
import config from '../payload.config';

type Json = Record<string, unknown>;
const [, , backupFile, flag] = process.argv;
if (!backupFile) throw new Error('Usage: migrate-media.ts <backup.json> [--dry]');
if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOBB_READ_WRITE_TOKEN) throw new Error('Unset the Vercel Blob token first: this script writes to the NEW storage.');
const dry = flag === '--dry';
const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8')) as { collections: Record<string, Json[]> };
const media = backup.collections.media ?? [];
console.log(`[media] ${media.length} files → ${process.env.S3_BUCKET ? `bucket ${process.env.S3_BUCKET}` : `disk ${process.env.MEDIA_DIR ?? 'apps/cms/media'}`}`);
if (dry) {
  media.slice(0, 5).forEach((m) => console.log(' ', m.id, m.filename, m.url));
  process.exit(0);
}

const payload = await getPayload({ config });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'babaloo-media-'));
let done = 0;
const failed: string[] = [];
for (const m of media) {
  const url = String(m.url ?? '');
  const filename = String(m.filename ?? '');
  try {
    if (!/^https?:\/\//.test(url)) throw new Error(`no absolute URL (${url})`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download ${res.status}`);
    const file = path.join(tmp, filename);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    await payload.update({
      collection: 'media',
      id: m.id as number,
      data: { alt: m.alt, caption: m.caption, focalX: m.focalX, focalY: m.focalY } as never,
      filePath: file,
      overwriteExistingFiles: true,
      context: { migration: true },
    });
    fs.rmSync(file);
    done++;
    if (done % 10 === 0) console.log(`[media] ${done}/${media.length}`);
  } catch (err) {
    failed.push(`${m.id} ${filename}: ${(err as Error).message}`);
  }
}
console.log(`[media] moved ${done} of ${media.length}`);
failed.forEach((f) => console.log(`  failed ${f}`));
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(failed.length ? 1 : 0);
