/**
 * Seeds Payload with the same content the frontend ships in
 * apps/web/src/content/seed (WordPress migration + PDF copy), uploading the
 * photos from apps/web/src/assets.
 *
 *   npm run seed --workspace apps/cms            # only fills empty collections/globals
 *   SEED_FORCE=1 npm run seed --workspace apps/cms   # wipes and re-seeds content
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD        # first admin user (created if no users exist)
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

  if (force) {
    // Galleries and media are referenced by globals (FK), so they are upserted instead of deleted.
    for (const collection of ['menu-items', 'menu-categories', 'locations', 'testimonials'] as const) {
      const { docs } = await payload.find({ collection, limit: 1000, depth: 0, pagination: false });
      for (const doc of docs) await payload.delete({ collection, id: doc.id });
      payload.logger.info(`[seed] cleared ${collection} (${docs.length})`);
    }
  }

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
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: path.basename(file) } }, limit: 1 });
    if (existing.docs[0]) {
      const id = existing.docs[0].id as number;
      const onDisk = path.join(process.env.MEDIA_DIR ?? path.resolve(process.cwd(), 'media'), existing.docs[0].filename ?? '');
      if (!fs.existsSync(onDisk) || force) {
        // Re-upload the file (keeps the same id, so every reference stays valid).
        await payload.update({ collection: 'media', id, data: { alt: ref.alt, caption: ref.caption }, filePath: file, overwriteExistingFiles: true });
      }
      mediaCache.set(ref.src, id);
      return id;
    }
    const doc = await payload.create({
      collection: 'media',
      data: { alt: ref.alt, caption: ref.caption },
      filePath: file,
    });
    mediaCache.set(ref.src, doc.id as number);
    return doc.id as number;
  };

  type Slugged = 'menu-items' | 'menu-categories' | 'locations' | 'galleries';
  /** Returns the id of an existing document with this slug (so re-running the seed only adds what is missing). */
  const findBySlug = async (collection: Slugged, slug: string): Promise<number | undefined> =>
    (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]?.id as number | undefined;
  const isEmpty = async (collection: Slugged | 'testimonials') => (await payload.count({ collection })).totalDocs === 0;

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

  // ---------- locations ----------
  {
    for (const l of readJson<Json[]>('locations.json')) {
      if (await findBySlug('locations', l.slug as string)) continue;
      await payload.create({
        collection: 'locations',
        data: {
          name: l.name as string,
          slug: l.slug as string,
          scriptName: (l.scriptName as string) || undefined,
          status: l.status as 'open' | 'coming-soon' | 'closed',
          address: l.address as never,
          geo: undefined,
          email: l.email as string | undefined,
          phone: l.phone as string | undefined,
          hoursDisplay: ((l.hoursDisplay as Json[]) ?? []) as never,
          hoursSpec: ((l.hoursSpec as Json[]) ?? []) as never,
          mapUrl: l.mapUrl as string | undefined,
          ...(l.geo ? { geo: l.geo as never } : {}),
          orderUrl: l.orderUrl as string | undefined,
          note: l.note as string | undefined,
          order: l.order as number,
          image: await upload(l.image as ImageRef),
        },
      });
    }
    payload.logger.info('[seed] locations done');
  }

  // ---------- galleries ----------
  const galleryIds = new Map<string, number>();
  {
    for (const g of readJson<Json[]>('galleries.json')) {
      const existing = await findBySlug('galleries', g.slug as string);
      if (existing && !force) {
        galleryIds.set(g.slug as string, existing);
        continue;
      }
      const images: { image: number; caption?: string }[] = [];
      for (const img of g.images as { image: ImageRef; caption?: string }[]) {
        const id = await upload(img.image);
        if (id) images.push({ image: id, caption: img.caption });
      }
      const data = { name: g.name as string, slug: g.slug as string, images };
      const doc = existing
        ? await payload.update({ collection: 'galleries', id: existing, data })
        : await payload.create({ collection: 'galleries', data });
      galleryIds.set(g.slug as string, doc.id as number);
    }
    payload.logger.info('[seed] galleries done');
  }

  // ---------- testimonials ----------
  if (await isEmpty('testimonials')) {
    for (const t of readJson<Json[]>('testimonials.json')) {
      await payload.create({ collection: 'testimonials', data: { quote: t.quote as string, author: t.author as string, role: t.role as string | undefined, rating: t.rating as number | undefined, order: (t.order as number) ?? 0, active: true } });
    }
  }

  // ---------- globals ----------
  const site = readJson('site.json');
  const seo = readJson('seo.json');
  const home = readJson<{ sections: Json[]; seo: Json }>('home.json');
  const pages = readJson<Record<string, Json>>('pages.json');

  const seoData = async (s: Json | undefined) => (s ? { ...s, ogImage: await upload(s.ogImage as ImageRef) } : undefined);
  const link = (l: unknown) => (l && typeof l === 'object' ? (l as Json) : undefined);

  const currentHome = await payload.findGlobal({ slug: 'homepage' });
  if (force || !(currentHome.sections?.length)) {
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

    const sections = [];
    for (const s of home.sections) {
      const { type, ...rest } = s;
      const block: Json = { blockType: type, ...rest };
      if (type === 'hero') {
        block.slides = [];
        for (const sl of s.slides as { image: ImageRef; imageMobile?: ImageRef; title?: string; subtitle?: string; text?: string; cta?: Json }[]) {
          block.slides = [...(block.slides as Json[]), { image: await upload(sl.image), imageMobile: await upload(sl.imageMobile), title: sl.title, subtitle: sl.subtitle, text: sl.text, cta: sl.cta }];
        }
      }
      if (type === 'gallery') block.gallery = galleryIds.get(s.gallery as string);
      sections.push(block);
    }
    await payload.updateGlobal({ slug: 'homepage', data: { sections, seo: await seoData(home.seo) } as never });

    const menuPage = pages.menuPage as Json;
    await payload.updateGlobal({ slug: 'menu-page', data: { intro: menuPage.intro, showPrices: menuPage.showPrices ?? true, seo: await seoData(menuPage.seo as Json) } as never });

    const about = pages.aboutPage as Json;
    await payload.updateGlobal({
      slug: 'about-page',
      data: {
        title: about.title,
        text: about.text,
        frames: [],
        showTeamSection: about.showTeamSection ?? true,
        teamImage: await upload(about.teamImage as ImageRef),
        showContactSection: about.showContactSection ?? true,
        seo: await seoData(about.seo as Json),
      } as never,
    });

    const contact = pages.contactPage as Json;
    await payload.updateGlobal({ slug: 'contact-page', data: { title: contact.title, text: contact.text, seo: await seoData(contact.seo as Json) } as never });

    const join = pages.joinPage as Json;
    await payload.updateGlobal({
      slug: 'join-page',
      data: {
        title: join.title,
        text: join.text,
        image: await upload(join.image as ImageRef),
        positions: (join.positions as string[]).map((label) => ({ label })),
        experienceLevels: (join.experienceLevels as string[]).map((label) => ({ label })),
        seo: await seoData(join.seo as Json),
      } as never,
    });

    const gallery = pages.galleryPage as Json;
    await payload.updateGlobal({ slug: 'gallery-page', data: { title: gallery.title, text: gallery.text, gallery: galleryIds.get(gallery.gallery as string), seo: await seoData(gallery.seo as Json) } as never });
    payload.logger.info('[seed] globals done');
  }

  payload.logger.info('[seed] complete');
  process.exit(0);
}

main().catch((err: { message?: string; data?: unknown }) => {
  console.error(err?.message ?? err);
  if (err?.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
