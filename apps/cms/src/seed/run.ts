/**
 * Seeds Payload with the same content the frontend ships in
 * apps/web/src/content/seed (WordPress/Toast migration + PDF copy), uploading
 * the photos from apps/web/src/assets into folders named after the page they
 * belong to.
 *
 *   npm run seed --workspace apps/cms                 # only adds what is missing
 *   SEED_FORCE=1 npm run seed --workspace apps/cms    # re-seeds menu + pages, re-uploads photos
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD            # first admin user (created if no users exist)
 */
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getPayload } from 'payload';
import config from '../payload.config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(dirname, '../../../web/src');
const SEED = path.join(WEB, 'content/seed');
const ASSETS = path.join(WEB, 'assets');

type Json = Record<string, unknown>;
type ImageRef = { src: string; alt: string; caption?: string };

const readJson = <T = Json>(file: string): T => JSON.parse(fs.readFileSync(path.join(SEED, file), 'utf8')) as T;

/** Folder for a seed image, from its file name. */
function folderNameFor(src: string): string {
  const name = path.basename(src);
  if (name.startsWith('hero-')) return 'Home · Hero';
  if (name.startsWith('location-')) return 'Home · Locations';
  if (name.startsWith('product-')) return 'Menu · Products';
  if (name.startsWith('gallery-')) return 'Gallery';
  if (name.startsWith('team-')) return 'About · Team';
  if (name.startsWith('logo')) return 'Brand';
  return 'Other';
}

async function main() {
  const payload = await getPayload({ config });
  const force = process.env.SEED_FORCE === '1';

  // ---------- admin user ----------
  const users = await payload.count({ collection: 'users' });
  if (users.totalDocs === 0) {
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@babaloocoffeeclub.com';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe-123!';
    await payload.create({ collection: 'users', data: { email, password, role: 'admin', name: 'Admin' } });
    payload.logger.info(`[seed] admin user created: ${email} — change the password after first login`);
  }

  // ---------- folders (one per page / section) ----------
  const folderIds = new Map<string, number>();
  const folder = async (name: string): Promise<number> => {
    if (folderIds.has(name)) return folderIds.get(name)!;
    const existing = await payload.find({ collection: 'folders', where: { name: { equals: name } }, limit: 1, depth: 0 });
    const id = existing.docs[0]
      ? (existing.docs[0].id as number)
      : ((await payload.create({ collection: 'folders', data: { name } as never })).id as number);
    folderIds.set(name, id);
    return id;
  };
  for (const name of ['Home · Hero', 'Home · Locations', 'Menu · Products', 'About · Team', 'Gallery', 'Brand', 'Other']) await folder(name);

  // ---------- media ----------
  const mediaCache = new Map<string, number>();
  const upload = async (ref?: ImageRef | null): Promise<number | undefined> => {
    if (!ref) return undefined;
    if (mediaCache.has(ref.src)) return mediaCache.get(ref.src);
    const file = path.join(ASSETS, ref.src);
    if (!fs.existsSync(file)) {
      payload.logger.warn(`[seed] missing image ${file}`);
      return undefined;
    }
    const folderId = await folder(folderNameFor(ref.src));
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: path.basename(file) } }, limit: 1 });
    if (existing.docs[0]) {
      const id = existing.docs[0].id as number;
      const onDisk = path.join(process.env.MEDIA_DIR ?? path.resolve(process.cwd(), 'media'), existing.docs[0].filename ?? '');
      if (!fs.existsSync(onDisk) || force) {
        // Re-upload the file (keeps the same id, so every reference stays valid).
        await payload.update({ collection: 'media', id, data: { alt: ref.alt, caption: ref.caption, folder: folderId } as never, filePath: file, overwriteExistingFiles: true });
      } else if (!existing.docs[0].folder) {
        await payload.update({ collection: 'media', id, data: { folder: folderId } as never });
      }
      mediaCache.set(ref.src, id);
      return id;
    }
    const doc = await payload.create({ collection: 'media', data: { alt: ref.alt, caption: ref.caption, folder: folderId } as never, filePath: file });
    mediaCache.set(ref.src, doc.id as number);
    return doc.id as number;
  };

  if (force) {
    for (const collection of ['menu-items', 'menu-categories'] as const) {
      const { docs } = await payload.find({ collection, limit: 1000, depth: 0, pagination: false });
      for (const doc of docs) await payload.delete({ collection, id: doc.id });
      payload.logger.info(`[seed] cleared ${collection} (${docs.length})`);
    }
  }

  type Slugged = 'menu-items' | 'menu-categories';
  const findBySlug = async (collection: Slugged, slug: string): Promise<number | undefined> =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]?.id as number | undefined;

  // ---------- menu ----------
  {
    const menu = readJson<{ categories: Json[]; items: Json[] }>('menu.json');
    const catIds = new Map<string, number>();
    let created = 0;
    for (const c of menu.categories.filter((c) => !c.parent)) {
      const existing = await findBySlug('menu-categories', c.slug as string);
      if (existing) {
        catIds.set(c.id as string, existing);
        continue;
      }
      created++;
      const doc = await payload.create({
        collection: 'menu-categories',
        data: { name: c.name as string, slug: c.slug as string, description: c.description as string | undefined, order: c.order as number, active: (c.active as boolean) ?? true, image: await upload(c.image as ImageRef) },
      });
      catIds.set(c.id as string, doc.id as number);
    }
    for (const c of menu.categories.filter((c) => c.parent)) {
      const existing = (await payload.find({ collection: 'menu-categories', where: { and: [{ slug: { equals: c.slug as string } }, { parent: { equals: catIds.get(c.parent as string) } }] }, limit: 1, depth: 0 })).docs[0]?.id as number | undefined;
      if (existing) {
        catIds.set(c.id as string, existing);
        continue;
      }
      created++;
      const doc = await payload.create({
        collection: 'menu-categories',
        data: { name: c.name as string, slug: c.slug as string, parent: catIds.get(c.parent as string), order: c.order as number, active: (c.active as boolean) ?? true, image: await upload(c.image as ImageRef) },
      });
      catIds.set(c.id as string, doc.id as number);
    }
    for (const i of menu.items) {
      if (await findBySlug('menu-items', i.slug as string)) continue;
      created++;
      await payload.create({
        collection: 'menu-items',
        data: {
          name: i.name as string,
          slug: i.slug as string,
          description: i.description as string | undefined,
          price: i.price as number | undefined,
          priceLabel: i.priceLabel as string | undefined,
          variants: (i.variants as { name: string; price: number }[] | undefined) ?? [],
          category: catIds.get(i.category as string)!,
          tags: ((i.tags as string[] | undefined) ?? []) as never,
          featured: (i.featured as boolean) ?? false,
          available: (i.available as boolean) ?? true,
          order: i.order as number,
          image: await upload(i.image as ImageRef),
        },
      });
    }
    payload.logger.info(`[seed] menu: ${created} documents created (${menu.categories.length} categories, ${menu.items.length} items in seed)`);
  }

  // ---------- pages (globals) ----------
  const site = readJson('site.json');
  const seo = readJson('seo.json');
  const home = readJson<{ sections: Json[]; seo: Json }>('home.json');
  const pages = readJson<Record<string, Json>>('pages.json');

  const seoData = async (s: Json | undefined) => (s ? { ...s, ogImage: await upload(s.ogImage as ImageRef) } : undefined);
  const link = (l: unknown) => (l && typeof l === 'object' ? (l as Json) : undefined);

  const currentHome = await payload.findGlobal({ slug: 'homepage' });
  if (force || !currentHome.sections?.length) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        ...(site as Json),
        logo: await upload(site.logo as ImageRef),
        nav: site.nav as Json[],
        footerNav: site.footerNav as Json[],
        primaryCta: link(site.primaryCta),
        secondaryCta: link(site.secondaryCta),
      } as never,
    });
    await payload.updateGlobal({ slug: 'seo-defaults', data: { ...seo, ogImage: await upload(seo.ogImage as ImageRef) } as never });

    const sections: Json[] = [];
    for (const s of home.sections) {
      const { type, ...rest } = s;
      const block: Json = { blockType: type, ...rest };
      if (type === 'hero') {
        const slides: Json[] = [];
        for (const sl of s.slides as { image: ImageRef; imageMobile?: ImageRef; title?: string; subtitle?: string; text?: string; cta?: Json }[]) {
          slides.push({ image: await upload(sl.image), imageMobile: await upload(sl.imageMobile), title: sl.title, subtitle: sl.subtitle, text: sl.text, cta: sl.cta });
        }
        block.slides = slides;
      }
      if (type === 'gallery') {
        const images: Json[] = [];
        for (const g of ((s.images as { image: ImageRef; caption?: string }[] | undefined) ?? [])) {
          const id = await upload(g.image);
          if (id) images.push({ image: id, caption: g.caption });
        }
        block.images = images;
      }
      if (type === 'locations') {
        const items: Json[] = [];
        for (const l of ((s.items as Json[] | undefined) ?? [])) {
          items.push({
            name: l.name,
            scriptName: (l.scriptName as string) || undefined,
            status: l.status,
            image: await upload(l.image as ImageRef),
            address: l.address,
            phone: l.phone,
            email: l.email,
            hoursDisplay: l.hoursDisplay ?? [],
            hoursSpec: l.hoursSpec ?? [],
            mapUrl: l.mapUrl,
            geo: l.geo,
            orderUrl: l.orderUrl,
            note: l.note,
          });
        }
        block.items = items;
      }
      sections.push(block);
    }
    await payload.updateGlobal({ slug: 'homepage', data: { sections, seo: await seoData(home.seo) } as never });

    const menuPage = pages.menuPage as Json;
    await payload.updateGlobal({ slug: 'menu-page', data: { intro: menuPage.intro, showPrices: menuPage.showPrices ?? true, seo: await seoData(menuPage.seo as Json) } as never });

    const about = pages.aboutPage as Json;
    const frames: Json[] = [];
    for (const f of ((about.frames as ImageRef[] | undefined) ?? [])) frames.push({ image: await upload(f) });
    await payload.updateGlobal({
      slug: 'about-page',
      data: {
        title: about.title,
        text: about.text,
        frames,
        showTeamSection: about.showTeamSection ?? true,
        teamImage: await upload(about.teamImage as ImageRef),
        join: {
          title: (about.join as Json).title,
          text: (about.join as Json).text,
          positions: ((about.join as Json).positions as string[]).map((label) => ({ label })),
          experienceLevels: ((about.join as Json).experienceLevels as string[]).map((label) => ({ label })),
        },
        showContactSection: about.showContactSection ?? true,
        seo: await seoData(about.seo as Json),
      } as never,
    });

    const contact = pages.contactPage as Json;
    await payload.updateGlobal({ slug: 'contact-page', data: { title: contact.title, text: contact.text, details: contact.details, seo: await seoData(contact.seo as Json) } as never });

    payload.logger.info('[seed] pages done');
  }

  payload.logger.info('[seed] complete');
  process.exit(0);
}

main().catch((err: { message?: string; data?: unknown }) => {
  console.error(err?.message ?? err);
  if (err?.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
