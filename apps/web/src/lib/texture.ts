/**
 * The marble / concrete tile used by the footer, the contact page and the menu photo panel.
 * Settings > Design can replace it; otherwise the bundled seamless tile is used.
 */
import { getImage } from 'astro:assets';
import concrete from '@/assets/textures/concrete.jpg';
import { getContent } from '@/lib/cms';
import { imageOptions } from '@/lib/images';

let cached: Promise<string> | undefined;

export function concreteTextureUrl(): Promise<string> {
  if (!cached) {
    cached = (async () => {
      const { design } = await getContent();
      const custom = design.footer.texture;
      if (custom) return (await getImage({ ...imageOptions(custom, Math.min(1200, custom.width)), format: 'webp', quality: 60 })).src;
      return (await getImage({ src: concrete, width: 720, format: 'webp', quality: 55 })).src;
    })();
  }
  return cached;
}
