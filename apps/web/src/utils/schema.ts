/**
 * Schema.org builders (JSON-LD). Kept in one place so the structure is easy
 * to audit in Google's Rich Results test.
 */
import type { Location, SiteSettings } from '@/lib/cms/types';

type Schema = Record<string, unknown>;

export function organizationSchema(settings: SiteSettings, siteUrl: string, logoUrl?: string): Schema {
  return {
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: settings.name,
    ...(settings.legalName ? { legalName: settings.legalName } : {}),
    url: siteUrl,
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    sameAs: settings.social.map((s) => s.url),
  };
}

export function cafeSchema(location: Location, settings: SiteSettings, siteUrl: string, imageUrl?: string): Schema | undefined {
  if (location.status !== 'open' || !location.address?.street) return undefined;
  const a = location.address;
  return {
    '@type': 'CafeOrCoffeeShop',
    '@id': `${siteUrl}#location-${location.slug}`,
    name: location.name === settings.name ? settings.name : `${settings.name} – ${location.name}`,
    parentOrganization: { '@id': `${siteUrl}#organization` },
    url: `${siteUrl}#locations`,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(location.phone || settings.phone ? { telephone: location.phone ?? settings.phone } : {}),
    ...(location.email || settings.email ? { email: location.email ?? settings.email } : {}),
    ...(settings.priceRange ? { priceRange: settings.priceRange } : {}),
    servesCuisine: ['Coffee', 'Matcha', 'Cafe'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: [a.street, a.suite].filter(Boolean).join(', '),
      addressLocality: a.city,
      addressRegion: a.region,
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
      addressCountry: a.country,
    },
    ...(location.geo
      ? { geo: { '@type': 'GeoCoordinates', latitude: location.geo.lat, longitude: location.geo.lng } }
      : {}),
    ...(location.mapUrl ? { hasMap: location.mapUrl } : {}),
    ...(location.hoursSpec.length
      ? {
          openingHoursSpecification: location.hoursSpec.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.dayOfWeek,
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
    ...(location.orderUrl ?? settings.orderUrl
      ? {
          potentialAction: {
            '@type': 'OrderAction',
            target: location.orderUrl ?? settings.orderUrl,
          },
        }
      : {}),
    sameAs: settings.social.map((s) => s.url),
  };
}

export function websiteSchema(settings: SiteSettings, siteUrl: string): Schema {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: settings.name,
    publisher: { '@id': `${siteUrl}#organization` },
    inLanguage: 'en-US',
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Schema {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function menuSchema(
  siteUrl: string,
  sections: { name: string; items: { name: string; description?: string; price?: number }[] }[],
  currency = 'USD',
): Schema {
  return {
    '@type': 'Menu',
    '@id': `${siteUrl}menu#menu`,
    name: 'Babaloo menu',
    hasMenuSection: sections.map((s) => ({
      '@type': 'MenuSection',
      name: s.name,
      hasMenuItem: s.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        ...(i.description ? { description: i.description } : {}),
        ...(typeof i.price === 'number'
          ? { offers: { '@type': 'Offer', price: i.price.toFixed(2), priceCurrency: currency } }
          : {}),
      })),
    })),
  };
}

export function graph(nodes: (Schema | undefined)[]): Schema {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
