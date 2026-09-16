/**
 * Makes the Next.js standalone output self-contained at `.next/standalone`:
 *   server.js, .next/ (with static), public/, node_modules/  — all at the same level.
 *
 * In this monorepo Next writes the app to `.next/standalone/apps/cms/server.js` with the shared
 * node_modules one level up. Hosts that start `.next/standalone/server.js` directly (Hostinger
 * Node.js apps) need the flat layout. Skipped on Vercel, which does not use the standalone folder.
 */
import fs from 'node:fs';
import path from 'node:path';

if (process.env.VERCEL) process.exit(0);
const appDir = process.cwd();
const standalone = path.join(appDir, '.next', 'standalone');
const nested = path.join(standalone, 'apps', 'cms');
if (!fs.existsSync(standalone)) {
  console.log('[flatten] no standalone output, nothing to do');
  process.exit(0);
}
if (fs.existsSync(nested)) {
  for (const entry of fs.readdirSync(nested)) {
    const from = path.join(nested, entry);
    const to = path.join(standalone, entry);
    if (entry === 'node_modules' && fs.existsSync(to)) {
      fs.cpSync(from, to, { recursive: true, force: false, errorOnExist: false });
      continue;
    }
    fs.rmSync(to, { recursive: true, force: true });
    fs.renameSync(from, to);
  }
  fs.rmSync(path.join(standalone, 'apps'), { recursive: true, force: true });
}
// Static assets and public files are not part of the traced output.
fs.cpSync(path.join(appDir, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true });
if (fs.existsSync(path.join(appDir, 'public'))) fs.cpSync(path.join(appDir, 'public'), path.join(standalone, 'public'), { recursive: true });
console.log(`[flatten] ${path.relative(appDir, standalone)}/server.js ready`);
