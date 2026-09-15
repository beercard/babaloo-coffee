import React from 'react'

/**
 * Always-visible account + logout actions at the bottom of the sidebar.
 * (Payload hides them behind the avatar menu, which clients rarely find.)
 *
 * For editors it also hides the technical bits they never need: the
 * "Browse by folder" entry, the "API" tab on documents and the API URL.
 */
type Props = { i18n?: { language?: string }; user?: { role?: string } | null }

export const NavFooter: React.FC<Props> = ({ i18n, user }) => {
  const es = i18n?.language === 'es'
  const isAdmin = user?.role === 'admin'
  return (
    <div className="bb-navfooter">
      {!isAdmin && (
        <style>{`
          .nav a[href$="/browse-by-folder"], .nav a[href*="/browse-by-folder"] { display: none !important; }
          .doc-tab[href$="/api"], .doc-tabs a[href$="/api"], .doc-tabs__tab[href$="/api"] { display: none !important; }
          .api-url { display: none !important; }
          #force-unlock { display: none !important; }
        `}</style>
      )}
      <a href="/admin/account" className="bb-navfooter__link">
        <span aria-hidden="true">👤</span> {es ? 'Mi cuenta e idioma' : 'My account & language'}
      </a>
      <a href="/admin/logout" className="bb-navfooter__link bb-navfooter__link--logout">
        <span aria-hidden="true">⎋</span> {es ? 'Cerrar sesión' : 'Log out'}
      </a>
    </div>
  )
}
