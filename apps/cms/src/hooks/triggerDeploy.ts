/**
 * Calls the frontend build hook after content changes so the static site is
 * republished automatically. Debounced: many edits in a row trigger one build.
 *
 *   DEPLOY_HOOK_URL     – e.g. GitHub repository_dispatch URL, a Vercel/Netlify
 *                         build hook, or any webhook your CI understands.
 *   DEPLOY_HOOK_METHOD  – POST (default)
 *   DEPLOY_HOOK_TOKEN   – optional bearer token (GitHub: a fine-grained PAT
 *                         with "contents: write" on the repo).
 *   DEPLOY_HOOK_BODY    – optional JSON body (GitHub: {"event_type":"cms-publish"})
 *   DEPLOY_DEBOUNCE_MS  – default 60000
 */
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload';

let timer: NodeJS.Timeout | undefined;

export function scheduleDeploy(reason: string): void {
  const url = process.env.DEPLOY_HOOK_URL;
  if (!url) return;
  const wait = Number(process.env.DEPLOY_DEBOUNCE_MS ?? 60_000);
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    timer = undefined;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' };
      if (process.env.DEPLOY_HOOK_TOKEN) headers.Authorization = `Bearer ${process.env.DEPLOY_HOOK_TOKEN}`;
      const res = await fetch(url, {
        method: process.env.DEPLOY_HOOK_METHOD ?? 'POST',
        headers,
        body: process.env.DEPLOY_HOOK_BODY ?? JSON.stringify({ event_type: 'cms-publish', client_payload: { reason } }),
      });
      console.info(`[deploy] hook called (${res.status}) — ${reason}`);
    } catch (err) {
      console.error('[deploy] hook failed', err);
    }
  }, wait);
}

export const triggerDeploy: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({ collection }) => {
  scheduleDeploy(`${collection.slug} changed`);
};

export const triggerDeployGlobal: GlobalAfterChangeHook = ({ global }) => {
  scheduleDeploy(`${global.slug} changed`);
};
