'use client'
import React, { useCallback, useEffect, useState } from 'react'

/**
 * "Status & test" tab of Settings > Forms: shows whether email sending is configured, where each
 * form's messages go, recent activity, and sends a test email on request.
 */
type Status = {
  smtp: boolean
  from: string | null
  recipients: { contact: string | null; careers: string | null }
  fields: { contact: number; careers: number }
  last30Days: number
  lastMessageAt: string | null
}

const es = () => typeof document !== 'undefined' && document.cookie.includes('payload-lng=es')

export const FormsStatus: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState('')
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null)
  const [sending, setSending] = useState(false)
  const L = (en: string, sp: string) => (es() ? sp : en)

  const load = useCallback(() => {
    fetch('/api/forms/status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setStatus)
      .catch((e) => setError(String(e.message ?? e)))
  }, [])
  useEffect(load, [load])

  const sendTest = async () => {
    setSending(true)
    setTest(null)
    try {
      const r = await fetch('/api/forms/test', { method: 'POST', credentials: 'include' })
      setTest(await r.json())
    } catch (e) {
      setTest({ ok: false, message: String((e as Error).message) })
    } finally {
      setSending(false)
    }
  }

  if (error) return <p className="bb-status__bad">{L('Could not load the status', 'No se pudo cargar el estado')}: {error}</p>
  if (!status) return <p>{L('Loading…', 'Cargando…')}</p>

  const row = (ok: boolean, label: string, value: React.ReactNode) => (
    <div className="bb-status__row">
      <span className={ok ? 'bb-status__dot bb-status__dot--ok' : 'bb-status__dot bb-status__dot--warn'} aria-hidden="true" />
      <span className="bb-status__label">{label}</span>
      <span className="bb-status__value">{value}</span>
    </div>
  )

  return (
    <div className="bb-status">
      <p className="bb-status__intro">
        {L(
          'Every message is saved in Messages. When email sending is configured, a copy also goes to the addresses below (with the résumé attached).',
          'Cada mensaje se guarda en Mensajes. Si el envío de emails está configurado, además llega una copia a las direcciones de abajo (con el currículum adjunto).',
        )}
      </p>
      {row(
        status.smtp,
        L('Email sending', 'Envío de emails'),
        status.smtp
          ? L(`Configured${status.from ? ` (from ${status.from})` : ''}`, `Configurado${status.from ? ` (desde ${status.from})` : ''}`)
          : L('Not configured yet: messages are only saved in Messages (ask your developer to add the SMTP password).', 'Aún no configurado: los mensajes solo se guardan en Mensajes (pedí al desarrollador que cargue la contraseña SMTP).'),
      )}
      {row(Boolean(status.recipients.contact), L('Contact form goes to', 'Contacto llega a'), status.recipients.contact ?? L('nobody (set an address above)', 'nadie (poné una dirección arriba)'))}
      {row(Boolean(status.recipients.careers), L('Join our team goes to', 'Empleo llega a'), status.recipients.careers ?? L('nobody (set an address above)', 'nadie (poné una dirección arriba)'))}
      {row(true, L('Fields', 'Campos'), `${L('Contact', 'Contacto')}: ${status.fields.contact} · ${L('Join our team', 'Empleo')}: ${status.fields.careers}`)}
      {row(
        true,
        L('Messages in the last 30 days', 'Mensajes en los últimos 30 días'),
        `${status.last30Days}${status.lastMessageAt ? ` · ${L('last one', 'el último')}: ${new Date(status.lastMessageAt).toLocaleString()}` : ''}`,
      )}
      <div className="bb-status__actions">
        <button type="button" className="btn btn--style-primary btn--size-medium" onClick={sendTest} disabled={sending}>
          {sending ? L('Sending…', 'Enviando…') : L('Send a test email', 'Enviar un email de prueba')}
        </button>
        <button type="button" className="btn btn--style-secondary btn--size-medium" onClick={load}>
          {L('Refresh', 'Actualizar')}
        </button>
        <a className="btn btn--style-secondary btn--size-medium" href="/admin/collections/form-submissions">
          {L('Open Messages', 'Abrir Mensajes')}
        </a>
      </div>
      {test && <p className={test.ok ? 'bb-status__good' : 'bb-status__bad'}>{test.message}</p>}
      <p className="bb-status__help">
        {L(
          'Full check: save and publish your changes, wait two minutes, send the form from the website, then look for it in Messages (and in the inbox).',
          'Prueba completa: guardá y publicá los cambios, esperá dos minutos, enviá el formulario desde la web y buscalo en Mensajes (y en el correo).',
        )}
      </p>
    </div>
  )
}
