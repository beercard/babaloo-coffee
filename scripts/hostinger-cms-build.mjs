/**
 * Deploys the CMS (Hostinger Node.js app) through the Hostinger API, so it does not depend on the
 * hPanel "Redeploy" button or on Hostinger's Git webhook, which has already missed pushes.
 *
 *   HOSTINGER_API_TOKEN=… node scripts/hostinger-cms-build.mjs [--git] [domain] [branch]
 *
 * Default: uploads a zip of this commit and builds from it (no GitHub ↔ Hostinger link needed).
 * With --git, Hostinger clones the repository itself, which needs the Git app connected in hPanel.
 * Hostinger builds with the settings stored for the website (root apps/cms, `npm run build`…), so
 * the running app is replaced only when the build succeeds.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const useGit = args.includes('--git');
const rest = args.filter((a) => !a.startsWith('--'));
const token = process.env.HOSTINGER_API_TOKEN;
const username = process.env.HOSTINGER_USERNAME || 'u731809005';
const domain = rest[0] || process.env.CMS_DOMAIN || 'cms.babaloocoffeeclub.com';
const branch = rest[1] || 'main';
const [owner, repository] = (process.env.GITHUB_REPOSITORY || 'beercard/babaloo-coffee').split('/');
if (!token) {
  console.error('Usage: HOSTINGER_API_TOKEN=… node scripts/hostinger-cms-build.mjs [--git] [domain] [branch]');
  process.exit(1);
}

const api = async (method, urlPath, body) => {
  const res = await fetch(`https://developers.hostinger.com${urlPath}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${urlPath} → ${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
};
const base = `/api/hosting/v1/accounts/${username}/websites/${domain}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gitSource() {
  const installations = (await api('GET', '/api/hosting/v1/git/installations?status=active')).data ?? [];
  const installation = installations.find((i) => JSON.stringify(i).toLowerCase().includes('github')) ?? installations[0];
  if (!installation) throw new Error('No active Git installation: connect GitHub in hPanel, or drop --git to upload a zip.');
  console.log(`[cms] git ${owner}/${repository}@${branch} (installation ${installation.uuid})`);
  return { source_type: 'git', source_options: { owner, repository, branch, installation_uuid: installation.uuid } };
}

async function archiveSource() {
  const zip = path.join(os.tmpdir(), `cms-${Date.now()}.zip`);
  execFileSync('git', ['archive', '--format=zip', '-o', zip, 'HEAD'], { stdio: 'inherit' });
  const data = fs.readFileSync(zip);
  const file = path.basename(zip);
  console.log(`[cms] archive ${file} (${(data.length / 1024 / 1024).toFixed(1)} MB) → ${domain}`);

  const upload = await api('POST', '/api/hosting/v1/files/upload-urls', { username, domain });
  const target = `${String(upload.url).replace(/\/$/, '')}/${encodeURIComponent(file)}?override=true`;
  const tus = { 'X-Auth': upload.auth_key, 'X-Auth-Rest': upload.rest_auth_key, 'Tus-Resumable': '1.0.0' };
  let res = await fetch(target, { method: 'POST', headers: { ...tus, 'Upload-Length': String(data.length), 'Upload-Offset': '0' } });
  if (res.status !== 201) throw new Error(`upload create → ${res.status} ${await res.text()}`);
  const CHUNK = 20 * 1024 * 1024;
  for (let offset = 0; offset < data.length; ) {
    const part = data.subarray(offset, offset + CHUNK);
    res = await fetch(target, {
      method: 'PATCH',
      headers: { ...tus, 'Content-Type': 'application/offset+octet-stream', 'Upload-Offset': String(offset) },
      body: part,
    });
    if (res.status !== 204) throw new Error(`upload chunk @${offset} → ${res.status} ${await res.text()}`);
    offset = Number(res.headers.get('upload-offset') ?? offset + part.length);
  }
  fs.rmSync(zip, { force: true });
  console.log('[cms] uploaded');
  return { source_type: 'archive', source_options: { archive_path: file } };
}

// The build takes the settings in the request, so reuse the ones stored for the website
// (framework, Node version, root/output directory, build script, package manager).
const stored = await api('GET', `${base}/nodejs/builds/settings`);
const settings = stored.data ?? stored;
const keep = ['node_version', 'app_type', 'root_directory', 'output_directory', 'build_script', 'entry_file', 'package_manager'];
const buildSettings = Object.fromEntries(keep.filter((k) => settings[k] !== undefined && settings[k] !== null).map((k) => [k, settings[k]]));
if (!buildSettings.node_version) buildSettings.node_version = 22;
console.log('[cms] settings', JSON.stringify(buildSettings));

const started = await api('POST', `${base}/nodejs/builds`, { ...buildSettings, ...(useGit ? await gitSource() : await archiveSource()) });
const uuid = started.uuid ?? started.data?.uuid;
console.log(`[cms] build ${uuid ?? '(no id returned)'} started`);

// Watch it: a failed build must fail this step instead of passing silently.
const deadline = Date.now() + 20 * 60_000;
let state = '';
while (Date.now() < deadline) {
  await sleep(20_000);
  const builds = (await api('GET', `${base}/nodejs/builds`)).data ?? [];
  const build = (uuid && builds.find((b) => b.uuid === uuid)) || builds[0];
  if (!build) continue;
  if (build.state !== state) console.log(`[cms] ${build.state}`);
  state = build.state;
  if (['success', 'completed', 'finished'].includes(state)) {
    console.log('[cms] build finished');
    process.exit(0);
  }
  if (['failed', 'error', 'cancelled'].includes(state)) {
    const logs = await api('GET', `${base}/nodejs/builds/${build.uuid}/logs`).catch(() => ({}));
    console.error(JSON.stringify(logs).slice(0, 4000));
    throw new Error(`build ${state}`);
  }
}
throw new Error('build did not finish within 20 minutes');
