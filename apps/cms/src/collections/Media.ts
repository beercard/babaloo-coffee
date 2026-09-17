import type { CollectionConfig } from 'payload';
import path from 'path';
import { editorContentDeletable } from '../access/roles';
import { t } from '../fields/i18n';

/** Uploads live outside the build output so they survive deploys (mount a volume here in Docker). */
const mediaDir = process.env.MEDIA_DIR ?? path.resolve(process.cwd(), 'media');

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: t('Image', 'Imagen'), plural: t('Images', 'Imágenes') },
  admin: {
    group: t('Media', 'Fotos'),
    description: t(
      'Photo library, organised in folders by page (Home · Menu · About · Gallery…). Upload into the right folder, add a short description, then pick the photo from the page or product. Replacing the file of an existing photo changes it on EVERY page that uses it: to change a photo in one place only, upload a new photo and pick it there.',
      'Biblioteca de fotos, organizada en carpetas por página (Home · Menu · About · Gallery…). Sube en la carpeta correcta, añade una descripción y luego elige la foto desde la página o el producto. Reemplazar el archivo de una foto existente la cambia en TODAS las páginas que la usan: para cambiar una foto en un solo lugar, sube una foto nueva y elígela ahí.',
    ),
    defaultColumns: ['filename', 'alt', 'folder', 'updatedAt'],
  },
  // Enables the folder browser for this collection (folders are created in the Images list).
  folders: true,
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
      label: t('Description (ALT text)', 'Descripción (texto ALT)'),
      required: true,
      admin: { description: t('Describe the photo in one sentence, e.g. "Iced latte in a Babaloo cup on a stone table".', 'Describe la foto en una frase, p. ej. "Iced latte in a Babaloo cup on a stone table".') },
    },
    { name: 'caption', type: 'text', label: t('Caption (optional)', 'Pie de foto (opcional)') },
  ],
};
