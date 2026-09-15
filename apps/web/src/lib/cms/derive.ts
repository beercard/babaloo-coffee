/**
 * Content that components consume as lists but that editors manage inside a
 * page: locations and testimonials live in Home page sections, gallery photos
 * in the Gallery page. Both content sources call this after mapping.
 */
import type { Gallery, GalleryPage, Homepage, Location, Testimonial } from './types';

export function deriveFromPages(homepage: Homepage, galleryPage: GalleryPage): { locations: Location[]; galleries: Gallery[]; testimonials: Testimonial[] } {
  const locations = homepage.sections
    .filter((s): s is Extract<typeof s, { type: 'locations' }> => s.type === 'locations')
    .flatMap((s) => s.items.map((l, i) => ({ ...l, id: l.id || `location-${i + 1}`, slug: l.slug || `location-${i + 1}`, order: l.order ?? i + 1 })))
    .filter((l) => l.status !== 'closed');
  const testimonials = homepage.sections
    .filter((s): s is Extract<typeof s, { type: 'testimonials' }> => s.type === 'testimonials')
    .flatMap((s) => s.items);
  const galleries: Gallery[] = [{ id: 'main', name: galleryPage.title, slug: 'main', images: galleryPage.images.map((g, i) => ({ ...g, order: g.order ?? i + 1 })) }];
  return { locations, galleries, testimonials };
}
