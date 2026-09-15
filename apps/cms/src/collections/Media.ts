import type { CollectionConfig } from 'payload';
import path from 'path';
import { editorContentDeletable } from '../access/roles';

/** Uploads live outside the build output so they survive deploys (mount a volume here in Docker). */
const mediaDir = process.env.MEDIA_DIR ?? path.resolve(process.cwd(), 'media');

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    group: 'Media',
    description: 'Upload photos here, then pick them from any page or product. Always fill in the description (ALT) — it is read by screen readers and Google.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: editorContentDeletable,
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    // The Astro build fetches the original and generates its own AVIF/WebP
    // sizes, so only a preview size is generated here.
    imageSizes: [{ name: 'thumbnail', width: 480, height: 480, fit: 'inside' }],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Description (ALT text)',
      required: true,
      admin: { description: 'Describe the photo in one sentence, e.g. "Iced latte in a Babaloo cup on a stone table".' },
    },
    { name: 'caption', type: 'text', label: 'Caption (optional)' },
  ],
};
