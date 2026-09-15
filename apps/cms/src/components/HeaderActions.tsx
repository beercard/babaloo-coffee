import React from 'react'

/** Log-out (and account) links in the top bar, right next to the avatar. */
type Props = { i18n?: { language?: string } }

export const HeaderActions: React.FC<Props> = ({ i18n }) => {
  const es = i18n?.language === 'es'
  return (
    <div className="bb-header-actions">
      <a href="/admin/account" className="bb-header-actions__link" title={es ? 'Mi cuenta e idioma' : 'My account & language'}>
        {es ? 'Mi cuenta' : 'My account'}
      </a>
      <a href="/admin/logout" className="bb-header-actions__link bb-header-actions__link--logout">
        <span aria-hidden="true">⎋</span> {es ? 'Cerrar sesión' : 'Log out'}
      </a>
    </div>
  )
}
