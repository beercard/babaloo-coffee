/**
 * Content that components consume as lists but that editors manage inside a
 * page: locations, testimonials and gallery photos all live in Home page
 * sections. Both content sources call this after mapping.
 */
import type { Gallery, Homepage, Location, Testimonial } from './types';

export function deriveFromPages(homepage: Homepage): { locations: Location[]; galleries: Gallery[]; testimonials: Testimonial[] } {
  const locations = homepage.sections
    .filter((s): s is Extract<typeof s, { type: 'locations' }> => s.type === 'locations')
    .flatMap((s) => s.items.map((l, i) => ({ ...l, id: l.id || `location-${i + 1}`, slug: l.slug || `location-${i + 1}`, order: l.order ?? i + 1 })))
    .filter((l) => l.status !== 'closed');
  const testimonials = homepage.sections
    .filter((s): s is Extract<typeof s, { type: 'testimonials' }> => s.type === 'testimonials')
    .flatMap((s) => s.items);
  const galleries: Gallery[] = homepage.sections
    .filter((s): s is Extract<typeof s, { type: 'gallery' }> => s.type === 'gallery')
    .map((s, i) => ({ id: i === 0 ? 'main' : `gallery-${i + 1}`, name: s.title ?? 'Gallery', slug: i === 0 ? 'main' : `gallery-${i + 1}`, images: s.images.map((g, k) => ({ ...g, order: g.order ?? k + 1 })) }));
  return { locations, galleries, testimonials };
}
