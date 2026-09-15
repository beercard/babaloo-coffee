import React from 'react'
import type { AdminViewServerProps } from 'payload'

/**
 * Task-oriented dashboard: the client lands on the things they actually
 * change (prices, photos, hours, texts) instead of a raw list of collections.
 * Super admins additionally see the Settings cards. Bilingual (en / es).
 */
type Card = { title: [string, string]; text: [string, string]; href: string; icon: string; admin?: boolean }
type Group = { title: [string, string]; cards: Card[] }

const groups: Group[] = [
  {
    title: ['Menu', 'Menú'],
    cards: [
      { title: ['Products', 'Productos'], text: ['Prices, descriptions, photos, labels. Hide a product with one checkbox.', 'Precios, descripciones, fotos, etiquetas. Oculta un producto con una casilla.'], href: '/admin/collections/menu-items', icon: '☕' },
      { title: ['Categories', 'Categorías'], text: ['Coffee, Matcha & non-coffee, Bites… and their Hot / Iced sections.', 'Coffee, Matcha & non-coffee, Bites… y sus secciones Hot / Iced.'], href: '/admin/collections/menu-categories', icon: '📋' },
      { title: ['Menu page text', 'Texto de la página Menú'], text: ['The intro at the top of the menu page.', 'El texto de arriba de la página del menú.'], href: '/admin/globals/menu-page', icon: '✏️' },
    ],
  },
  {
    title: ['Home', 'Portada'],
    cards: [
      { title: ['Home page', 'Página de inicio'], text: ['Hero photos, welcome text, order and visibility of every section.', 'Fotos del hero, texto de bienvenida, orden y visibilidad de cada sección.'], href: '/admin/globals/homepage', icon: '🏠' },
      { title: ['Locations & hours', 'Locales y horarios'], text: ['Address, opening hours, map link and "coming soon" locations.', 'Dirección, horarios, enlace al mapa y locales "coming soon".'], href: '/admin/collections/locations', icon: '📍' },
      { title: ['Testimonials', 'Testimonios'], text: ['Guest quotes (optional section).', 'Frases de clientes (sección opcional).'], href: '/admin/collections/testimonials', icon: '💬' },
    ],
  },
  {
    title: ['Pages', 'Páginas'],
    cards: [
      { title: ['About', 'About'], text: ['Framed photos, text, team photo and section toggles.', 'Fotos enmarcadas, texto, foto del equipo y secciones.'], href: '/admin/globals/about-page', icon: '🐶' },
      { title: ['Contact', 'Contacto'], text: ['Title and intro of the contact page.', 'Título e intro de la página de contacto.'], href: '/admin/globals/contact-page', icon: '✉️' },
      { title: ['Join our team', 'Únete al equipo'], text: ['Careers text, photo, positions and experience options.', 'Texto, foto, puestos y niveles de experiencia.'], href: '/admin/globals/join-page', icon: '🤝' },
      { title: ['Gallery page', 'Página Galería'], text: ['Which gallery the /gallery page shows.', 'Qué galería muestra la página /gallery.'], href: '/admin/globals/gallery-page', icon: '🖼️' },
    ],
  },
  {
    title: ['Photos & messages', 'Fotos y mensajes'],
    cards: [
      { title: ['Images', 'Imágenes'], text: ['Upload photos once, reuse them anywhere. Always add a short description.', 'Sube las fotos una vez y úsalas donde quieras. Añade siempre una descripción.'], href: '/admin/collections/media', icon: '📷' },
      { title: ['Galleries', 'Galerías'], text: ['The gallery page and the three framed photos on About. Drag to reorder.', 'La galería de la web y las tres fotos enmarcadas de About. Arrastra para ordenar.'], href: '/admin/collections/galleries', icon: '🗂️' },
      { title: ['Inbox', 'Mensajes'], text: ['Messages from the Contact and Join our team forms.', 'Mensajes de los formularios de contacto y empleo.'], href: '/admin/collections/form-submissions', icon: '📥' },
    ],
  },
  {
    title: ['Settings (super admin)', 'Ajustes (super admin)'],
    cards: [
      { title: ['Site settings', 'Ajustes del sitio'], text: ['Business name, contact details, social links, navigation.', 'Nombre, datos de contacto, redes, navegación.'], href: '/admin/globals/site-settings', icon: '⚙️', admin: true },
      { title: ['SEO defaults', 'SEO por defecto'], text: ['Default title, description and share image for Google.', 'Título, descripción e imagen por defecto para Google.'], href: '/admin/globals/seo-defaults', icon: '🔍', admin: true },
      { title: ['Users', 'Usuarios'], text: ['Who can log in. Super admins manage everything; editors edit content.', 'Quién puede entrar. Super admins gestionan todo; editores editan contenido.'], href: '/admin/collections/users', icon: '👤', admin: true },
    ],
  },
]

const howto: [string, string][] = [
  ['<b>Change a price</b> → Products → open the item → <em>Price (USD)</em> → Save.', '<b>Cambiar un precio</b> → Productos → abre el producto → <em>Price (USD)</em> → Guardar.'],
  ['<b>Change a product photo</b> → Products → open the item → <em>Product photo</em> → Choose or Upload → Save.', '<b>Cambiar la foto de un producto</b> → Productos → abre el producto → <em>Product photo</em> → Elegir o Subir → Guardar.'],
  ['<b>Change opening hours</b> → Locations & hours → open the location → <em>Opening hours</em> → Save.', '<b>Cambiar el horario</b> → Locales y horarios → abre el local → <em>Opening hours</em> → Guardar.'],
  ['<b>Change the welcome text</b> → Home page → <em>Intro text</em> → Save.', '<b>Cambiar el texto de bienvenida</b> → Página de inicio → <em>Intro text</em> → Guardar.'],
  ['<b>Hide something temporarily</b> → untick <em>Available</em> (products) or <em>Show this section</em> (home) instead of deleting.', '<b>Ocultar algo temporalmente</b> → desmarca <em>Available</em> (productos) o <em>Show this section</em> (portada) en vez de borrar.'],
]

export const Dashboard: React.FC<AdminViewServerProps> = (props) => {
  const req = props.initPageResult?.req
  const user = req?.user as { role?: string; name?: string; email?: string } | null | undefined
  const es = req?.i18n?.language === 'es'
  const L = (pair: [string, string]) => (es ? pair[1] : pair[0])
  const isAdmin = user?.role === 'admin'
  const visible = groups.map((g) => ({ ...g, cards: g.cards.filter((c) => !c.admin || isAdmin) })).filter((g) => g.cards.length > 0)

  return (
    <div className="bb-dashboard">
      <header className="bb-dashboard__head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" className="bb-dashboard__logo" />
        <div>
          <h1 className="bb-dashboard__title">
            {es ? 'Hola' : 'Hello'}
            {user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="bb-dashboard__lead">
            {es
              ? 'Todo lo que guardes aquí se publica en la web automáticamente en un par de minutos.'
              : 'Everything you save here is published to the website automatically within a couple of minutes.'}
            {!isAdmin && (es ? ' ¿Necesitas cambiar un ajuste (nombre, email, redes)? Pídeselo a un super admin.' : ' Need a setting changed (name, email, social links)? Ask a super admin.')}
          </p>
          <p className="bb-dashboard__lang">
            {es ? 'Idioma del panel: ' : 'Panel language: '}
            <a href="/admin/account">{es ? 'cambiar en Mi cuenta' : 'change in My account'}</a>
          </p>
        </div>
      </header>

      {visible.map((group) => (
        <section key={group.title[0]} className="bb-dashboard__group" aria-labelledby={`bb-${group.title[0]}`}>
          <h2 id={`bb-${group.title[0]}`} className="bb-dashboard__group-title">
            {L(group.title)}
          </h2>
          <ul className="bb-dashboard__grid">
            {group.cards.map((card) => (
              <li key={card.href}>
                <a href={card.href} className="bb-card">
                  <span className="bb-card__icon" aria-hidden="true">
                    {card.icon}
                  </span>
                  <span className="bb-card__title">{L(card.title)}</span>
                  <span className="bb-card__text">{L(card.text)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="bb-dashboard__group bb-dashboard__howto" aria-labelledby="bb-howto">
        <h2 id="bb-howto" className="bb-dashboard__group-title">
          {es ? 'Guía rápida' : 'Quick how-to'}
        </h2>
        <ul className="bb-dashboard__howto-list">
          {howto.map((pair, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: L(pair) }} />
          ))}
        </ul>
      </section>
    </div>
  )
}
