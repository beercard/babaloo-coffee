/**
 * Publishes a static site archive to a Hostinger website through the Hostinger API
 * (upload with TUS, then "Deploy static site archive", then clear the cache).
 *
 *   HOSTINGER_API_TOKEN=… node scripts/hostinger-deploy.mjs <site.zip> <domain> [username]
 *
 * WARNING: the deploy replaces the website's current files.
 */
import fs from 'node:fs';
import path from 'node:path';

const [archive, domain, usernameArg] = process.argv.slice(2);
const token = process.env.HOSTINGER_API_TOKEN;
const username = usernameArg || process.env.HOSTINGER_USERNAME;
if (!archive || !domain || !token || !username) {
  console.error('Usage: HOSTINGER_API_TOKEN=… node scripts/hostinger-deploy.mjs <site.zip> <domain> <username>');
  process.exit(1);
}

const api = async (method, url, body) => {
  const res = await fetch(`https://developers.hostinger.com${url}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
};

const file = path.basename(archive);
const data = fs.readFileSync(archive);
console.log(`[deploy] ${file} (${(data.length / 1024 / 1024).toFixed(1)} MB) → ${domain}`);

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
console.log('[deploy] uploaded');

await api('POST', `/api/hosting/v1/accounts/${username}/websites/${domain}/deploy`, { archive_path: file });
console.log('[deploy] deploy requested');
try {
  await api('DELETE', `/api/hosting/v1/accounts/${username}/websites/${domain}/cache/clear`);
  console.log('[deploy] cache cleared');
} catch (err) {
  console.log(`[deploy] cache not cleared: ${err.message}`);
}
