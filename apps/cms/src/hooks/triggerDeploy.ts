/**
 * Rebuilds the static sites after content changes. Debounced: many edits in a row trigger one build.
 *
 *   DEPLOY_HOOK_URL          – live site build hook (Vercel/Netlify/Cloudflare, or GitHub repository_dispatch).
 *                              Called only when something is PUBLISHED (drafts never reach the live site).
 *   PREVIEW_DEPLOY_HOOK_URL  – optional preview site build hook, called on every save (drafts included).
 *   PREVIEW_DEPLOY_HOOK_BODY – optional body for it (GitHub: {"event_type":"cms-draft"}). With a GitHub
 *                              URL the DEPLOY_HOOK_TOKEN is reused unless PREVIEW_DEPLOY_HOOK_TOKEN is set.
 *   DEPLOY_HOOK_METHOD       – POST (default)
 *   DEPLOY_HOOK_TOKEN        – optional bearer token (GitHub: fine-grained PAT with "contents: write").
 *   DEPLOY_HOOK_BODY         – optional JSON body (GitHub: {"event_type":"cms-publish"})
 *   DEPLOY_DEBOUNCE_MS       – default 60000 (preview: PREVIEW_DEBOUNCE_MS, default 20000)
 */
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload';

const timers = new Map<string, NodeJS.Timeout>();

function schedule(target: 'live' | 'preview', reason: string): void {
  const url = target === 'live' ? process.env.DEPLOY_HOOK_URL : process.env.PREVIEW_DEPLOY_HOOK_URL;
  if (!url) return;
  const wait = Number((target === 'live' ? process.env.DEPLOY_DEBOUNCE_MS : process.env.PREVIEW_DEBOUNCE_MS) ?? (target === 'live' ? 60_000 : 20_000));
  clearTimeout(timers.get(target));
  timers.set(
    target,
    setTimeout(async () => {
      timers.delete(target);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' };
        const token = target === 'live' ? process.env.DEPLOY_HOOK_TOKEN : process.env.PREVIEW_DEPLOY_HOOK_TOKEN || (url.includes('api.github.com') ? process.env.DEPLOY_HOOK_TOKEN : undefined);
        if (token) headers.Authorization = `Bearer ${token}`;
        const body = target === 'live' ? process.env.DEPLOY_HOOK_BODY : process.env.PREVIEW_DEPLOY_HOOK_BODY;
        const res = await fetch(url, {
          method: process.env.DEPLOY_HOOK_METHOD ?? 'POST',
          headers,
          body: body || JSON.stringify({ event_type: target === 'live' ? 'cms-publish' : 'cms-draft', client_payload: { reason, target } }),
        });
        console.info(`[deploy:${target}] hook called (${res.status}) — ${reason}`);
      } catch (err) {
        console.error(`[deploy:${target}] hook failed`, err);
      }
    }, wait),
  );
}

/** `published` = the change is live content (drafts only rebuild the preview site). */
export function scheduleDeploy(reason: string, published = true): void {
  schedule('preview', reason);
  if (published) schedule('live', reason);
}

const isDraft = (doc: unknown) => (doc as { _status?: string } | undefined)?._status === 'draft';

export const triggerDeploy: CollectionAfterChangeHook = ({ collection, doc, previousDoc }) => {
  // Drafts only rebuild the preview. When the previous state was published we also rebuild the live
  // site (covers "Unpublish"; for a plain draft save it is a harmless no-op build).
  const live = !isDraft(doc) || (previousDoc as { _status?: string } | undefined)?._status === 'published';
  scheduleDeploy(`${collection.slug} changed`, live);
};

export const triggerDeployDelete: CollectionAfterDeleteHook = ({ collection }) => {
  scheduleDeploy(`${collection.slug} deleted`);
};

export const triggerDeployGlobal: GlobalAfterChangeHook = ({ global, doc }) => {
  scheduleDeploy(`${global.slug} changed`, !isDraft(doc));
};
