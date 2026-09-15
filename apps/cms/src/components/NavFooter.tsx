import React from 'react'

/**
 * Always-visible account + logout actions at the bottom of the sidebar.
 * (Payload hides them behind the avatar menu, which clients rarely find.)
 */
type Props = { i18n?: { language?: string } }

export const NavFooter: React.FC<Props> = ({ i18n }) => {
  const es = i18n?.language === 'es'
  return (
    <div className="bb-navfooter">
      <a href="/admin/account" className="bb-navfooter__link">
        <span aria-hidden="true">👤</span> {es ? 'Mi cuenta e idioma' : 'My account & language'}
      </a>
      <a href="/admin/logout" className="bb-navfooter__link bb-navfooter__link--logout">
        <span aria-hidden="true">⎋</span> {es ? 'Cerrar sesión' : 'Log out'}
      </a>
    </div>
  )
}
