import type { APIRoute, GetStaticPaths } from 'astro';
import { spriteHash, spriteSvg } from '@/lib/sprite';

export const getStaticPaths = (() => [{ params: { hash: spriteHash } }]) satisfies GetStaticPaths;

export const GET: APIRoute = () =>
  new Response(spriteSvg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
