import React from 'react'
import type { AdminViewServerProps } from 'payload'

/**
 * Task-oriented dashboard: the client lands on the things they actually
 * change (prices, photos, hours, texts) instead of a raw list of collections.
 * Super admins additionally see the Settings cards.
 */
type Card = { title: string; text: string; href: string; icon: string; admin?: boolean }

const groups: { title: string; cards: Card[] }[] = [
  {
    title: 'Menu',
    cards: [
      { title: 'Products', text: 'Prices, descriptions, photos, labels. Hide a product with one checkbox.', href: '/admin/collections/menu-items', icon: '☕' },
      { title: 'Categories', text: 'Coffee, Matcha & non-coffee, Bites… and their Hot / Iced sections.', href: '/admin/collections/menu-categories', icon: '📋' },
      { title: 'Menu page text', text: 'The intro at the top of the menu page.', href: '/admin/globals/menu-page', icon: '✏️' },
    ],
  },
  {
    title: 'Home',
    cards: [
      { title: 'Home page', text: 'Hero photos, welcome text, order and visibility of every section.', href: '/admin/globals/homepage', icon: '🏠' },
      { title: 'Locations & hours', text: 'Address, opening hours, map link and "coming soon" locations.', href: '/admin/collections/locations', icon: '📍' },
      { title: 'Testimonials', text: 'Guest quotes (optional section).', href: '/admin/collections/testimonials', icon: '💬' },
    ],
  },
  {
    title: 'Pages',
    cards: [
      { title: 'About', text: 'Framed photos, text, team photo and section toggles.', href: '/admin/globals/about-page', icon: '🐶' },
      { title: 'Contact', text: 'Title and intro of the contact page.', href: '/admin/globals/contact-page', icon: '✉️' },
      { title: 'Join our team', text: 'Careers text, photo, positions and experience options.', href: '/admin/globals/join-page', icon: '🤝' },
      { title: 'Gallery page', text: 'Which gallery the /gallery page shows.', href: '/admin/globals/gallery-page', icon: '🖼️' },
    ],
  },
  {
    title: 'Photos & messages',
    cards: [
      { title: 'Images', text: 'Upload photos once, reuse them anywhere. Always add a short description.', href: '/admin/collections/media', icon: '📷' },
      { title: 'Galleries', text: 'The gallery page and the three framed photos on About. Drag to reorder.', href: '/admin/collections/galleries', icon: '🗂️' },
      { title: 'Inbox', text: 'Messages from the Contact and Join our team forms.', href: '/admin/collections/form-submissions', icon: '📥' },
    ],
  },
  {
    title: 'Settings (super admin)',
    cards: [
      { title: 'Site settings', text: 'Business name, contact details, social links, navigation.', href: '/admin/globals/site-settings', icon: '⚙️', admin: true },
      { title: 'SEO defaults', text: 'Default title, description and share image for Google.', href: '/admin/globals/seo-defaults', icon: '🔍', admin: true },
      { title: 'Users', text: 'Who can log in. Super admins manage everything; editors edit content.', href: '/admin/collections/users', icon: '👤', admin: true },
    ],
  },
]

export const Dashboard: React.FC<AdminViewServerProps> = (props) => {
  const user = props.initPageResult?.req?.user as { role?: string; name?: string; email?: string } | null | undefined
  const isAdmin = user?.role === 'admin'
  const visible = groups
    .map((g) => ({ ...g, cards: g.cards.filter((c) => !c.admin || isAdmin) }))
    .filter((g) => g.cards.length > 0)

  return (
    <div className="bb-dashboard">
      <header className="bb-dashboard__head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" className="bb-dashboard__logo" />
        <div>
          <h1 className="bb-dashboard__title">Hello{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="bb-dashboard__lead">
            Everything you save here is published to the website automatically within a couple of minutes.
            {!isAdmin && ' Need a setting changed (name, email, social links)? Ask a super admin.'}
          </p>
        </div>
      </header>

      {visible.map((group) => (
        <section key={group.title} className="bb-dashboard__group" aria-labelledby={`bb-${group.title}`}>
          <h2 id={`bb-${group.title}`} className="bb-dashboard__group-title">
            {group.title}
          </h2>
          <ul className="bb-dashboard__grid">
            {group.cards.map((card) => (
              <li key={card.href}>
                <a href={card.href} className="bb-card">
                  <span className="bb-card__icon" aria-hidden="true">
                    {card.icon}
                  </span>
                  <span className="bb-card__title">{card.title}</span>
                  <span className="bb-card__text">{card.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="bb-dashboard__group bb-dashboard__howto" aria-labelledby="bb-howto">
        <h2 id="bb-howto" className="bb-dashboard__group-title">
          Quick how-to
        </h2>
        <ul className="bb-dashboard__howto-list">
          <li>
            <strong>Change a price</strong> → Products → open the item → <em>Price (USD)</em> → Save.
          </li>
          <li>
            <strong>Change a product photo</strong> → Products → open the item → <em>Product photo</em> → Choose or Upload → Save.
          </li>
          <li>
            <strong>Change opening hours</strong> → Locations & hours → open the location → <em>Opening hours</em> → Save.
          </li>
          <li>
            <strong>Change the welcome text</strong> → Home page → <em>Intro text</em> → Save.
          </li>
          <li>
            <strong>Hide something temporarily</strong> → untick <em>Available</em> (products) or <em>Show this section</em> (home) instead of deleting.
          </li>
        </ul>
      </section>
    </div>
  )
}
