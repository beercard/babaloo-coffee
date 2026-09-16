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
    title: ['Pages — edit each section in place', 'Páginas — edita cada sección en su sitio'],
    cards: [
      { title: ['Home page', 'Página de inicio'], text: ['Hero photos · icons band · welcome text · locations & hours · any extra section.', 'Fotos del hero · franja de iconos · texto de bienvenida · locales y horarios · cualquier sección extra.'], href: '/admin/globals/homepage', icon: '🏠' },
      { title: ['Menu page', 'Página Menú'], text: ['Intro text, prices on/off, location selector, extra sections.', 'Texto de intro, precios sí/no, selector de local, secciones extra.'], href: '/admin/globals/menu-page', icon: '✏️' },
      { title: ['About page', 'Página About'], text: ['Title · gold frames and carousels · text · Join our team · extra sections.', 'Título · marcos dorados y carruseles · texto · Únete al equipo · secciones extra.'], href: '/admin/globals/about-page', icon: '🐶' },
      { title: ['Contact page', 'Página Contacto'], text: ['Title, intro, contact details column, extra sections.', 'Título, intro, columna de datos de contacto, secciones extra.'], href: '/admin/globals/contact-page', icon: '✉️' },
      { title: ['New pages', 'Páginas nuevas'], text: ['Create extra pages (events, catering…) with the same sections as the home page.', 'Crea páginas extra (eventos, catering…) con las mismas secciones que la portada.'], href: '/admin/collections/pages', icon: '📄' },
    ],
  },
  {
    title: ['Menu', 'Menú'],
    cards: [
      { title: ['Products', 'Productos'], text: ['Prices, descriptions, photos, labels, locations. Hide a product with one checkbox.', 'Precios, descripciones, fotos, etiquetas, locales. Oculta un producto con una casilla.'], href: '/admin/collections/menu-items', icon: '☕' },
      { title: ['Categories', 'Categorías'], text: ['Coffee, Matcha, Food… and their Hot / Iced sections. Order and line breaks.', 'Coffee, Matcha, Food… y sus secciones Hot / Iced. Orden y saltos de línea.'], href: '/admin/collections/menu-categories', icon: '📋' },
      { title: ['Labels & locations', 'Etiquetas y locales'], text: ['Create badges (Signature, New…) and location labels with their colours.', 'Crea distintivos (Signature, New…) y etiquetas de local con sus colores.'], href: '/admin/collections/menu-labels', icon: '🏷️' },
    ],
  },
  {
    title: ['Photos & messages', 'Fotos y mensajes'],
    cards: [
      { title: ['Images', 'Imágenes'], text: ['Photo library in folders by page. Upload here, set the focal point, then pick it from the page.', 'Biblioteca en carpetas por página. Sube aquí, marca el punto focal y luego elígela desde la página.'], href: '/admin/collections/media', icon: '📷' },
      { title: ['Inbox', 'Mensajes'], text: ['Messages from the Contact and Join our team forms.', 'Mensajes de los formularios de contacto y empleo.'], href: '/admin/collections/form-submissions', icon: '📥' },
    ],
  },
  {
    title: ['Settings', 'Ajustes'],
    cards: [
      { title: ['Design', 'Diseño'], text: ['Colours, fonts, sizes, spacing, header (logo, wood, curtain) and footer.', 'Colores, tipografías, tamaños, espacios, header (logo, madera, cortina) y footer.'], href: '/admin/globals/design', icon: '🎨' },
      { title: ['Site settings', 'Ajustes del sitio'], text: ['Business name, contact details, social links, navigation and footer texts.', 'Nombre, datos de contacto, redes, navegación y textos del footer.'], href: '/admin/globals/site-settings', icon: '⚙️' },
      { title: ['Forms', 'Formularios'], text: ['Fields, dropdowns, required fields, recipients, confirmation messages and a test email.', 'Campos, desplegables, obligatorios, destinatarios, mensajes de confirmación y email de prueba.'], href: '/admin/globals/forms', icon: '📝' },
      { title: ['SEO defaults', 'SEO por defecto'], text: ['Default title, description and share image for Google. Page SEO boxes are also super-admin only.', 'Título, descripción e imagen por defecto para Google. Los SEO de cada página también son solo para super admin.'], href: '/admin/globals/seo-defaults', icon: '🔍', admin: true },
      { title: ['Users', 'Usuarios'], text: ['Who can log in. Super admins manage everything; editors edit content.', 'Quién puede entrar. Super admins gestionan todo; editores editan contenido.'], href: '/admin/collections/users', icon: '👤', admin: true },
    ],
  },
]

const howto: [string, string][] = [
  ['<b>Publish</b> → <em>Save draft</em> keeps changes private (preview site); <em>Publish changes</em> puts them live within about two minutes.', '<b>Publicar</b> → <em>Guardar borrador</em> deja los cambios en privado (sitio de vista previa); <em>Publicar cambios</em> los pone en vivo en unos dos minutos.'],
  ['<b>Undo a mistake</b> → open the page or product → <em>Versions</em> tab → pick an earlier version → <em>Restore</em>.', '<b>Deshacer un error</b> → abre la página o el producto → pestaña <em>Versiones</em> → elige una versión anterior → <em>Restaurar</em>.'],
  ['<b>Change a price</b> → Products → open the item → <em>Price (USD)</em> → Publish changes.', '<b>Cambiar un precio</b> → Productos → abre el producto → <em>Precio (USD)</em> → Publicar cambios.'],
  ['<b>Change opening hours</b> → Home page → section <em>Locations</em> → the location → <em>Opening hours</em>.', '<b>Cambiar el horario</b> → Página de inicio → sección <em>Locales</em> → el local → <em>Horario</em>.'],
  ['<b>Add or duplicate a section</b> → open the page → <em>Add Section</em>, or the row menu (⋯) → <em>Duplicate</em>. Drag rows to reorder.', '<b>Agregar o duplicar una sección</b> → abre la página → <em>Agregar sección</em>, o el menú de la fila (⋯) → <em>Duplicar</em>. Arrastra para reordenar.'],
  ['<b>Hide something temporarily</b> → untick <em>Available</em> (products) or <em>Show this section</em> (sections) instead of deleting.', '<b>Ocultar algo temporalmente</b> → desmarca <em>Disponible</em> (productos) o <em>Mostrar esta sección</em> (secciones) en vez de borrar.'],
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
              ? 'Usa “Publicar cambios” para que la web se actualice sola en un par de minutos; “Guardar borrador” guarda sin publicar. Cada página guarda su historial para volver atrás.'
              : 'Use “Publish changes” and the website updates itself within a couple of minutes; “Save draft” keeps your work without publishing. Every page keeps a history so you can go back.'}
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
