'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * Readable titles for array rows and page sections, so editors see "Name · Short text · required"
 * or "03 · Welcome text — Babaloo is a little devotion…" instead of "Field 01" / "Untitled".
 */
type Json = Record<string, unknown>

const es = () => typeof document !== 'undefined' && document.cookie.includes('payload-lng=es')

const snippet = (v: unknown, max = 60): string => {
  if (typeof v !== 'string') return ''
  const text = v.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

const TYPE_LABELS: Record<string, [string, string]> = {
  text: ['Short text', 'Texto corto'],
  email: ['Email', 'Email'],
  tel: ['Phone', 'Teléfono'],
  textarea: ['Long text', 'Texto largo'],
  select: ['Dropdown', 'Desplegable'],
  number: ['Number', 'Número'],
  date: ['Date', 'Fecha'],
  url: ['Link', 'Enlace'],
  file: ['File upload', 'Subir archivo'],
}

/** Array rows: first non-empty of the configured fields, plus optional details. */
export const RowLabel: React.FC<{ fields?: string[]; fallback?: [string, string]; kind?: 'formField' | 'link' | 'hours' | 'location' }> = ({
  fields = ['label', 'name', 'title'],
  fallback = ['Item', 'Elemento'],
  kind,
}) => {
  const { data, rowNumber } = useRowLabel<Json>()
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const L = (pair: [string, string]) => (es() ? pair[1] : pair[0])
  const main = fields.map((f) => snippet(data?.[f])).find(Boolean)
  let extra = ''
  if (kind === 'formField') {
    const type = TYPE_LABELS[String(data?.type ?? 'text')]
    extra = [type ? L(type) : '', data?.required ? L(['required', 'obligatorio']) : '', data?.width === 'full' ? L(['full width', 'ancho completo']) : ''].filter(Boolean).join(' · ')
  } else if (kind === 'link') {
    extra = snippet(data?.href, 50)
  } else if (kind === 'hours') {
    extra = snippet(data?.hours, 40)
  } else if (kind === 'location') {
    const status = String(data?.status ?? 'open')
    extra = status === 'coming-soon' ? L(['coming soon', 'próximamente']) : status === 'closed' ? L(['hidden', 'oculto']) : ''
  }
  return (
    <span className="bb-rowlabel">
      <span className="bb-rowlabel__num">{n}</span>
      <span className="bb-rowlabel__main">{main || L(fallback)}</span>
      {extra ? <span className="bb-rowlabel__extra">{extra}</span> : null}
    </span>
  )
}

const BLOCK_LABELS: Record<string, [string, string]> = {
  hero: ['Hero photos', 'Fotos del hero'],
  iconStrip: ['Icons band', 'Franja de iconos'],
  navRow: ['Links row', 'Fila de enlaces'],
  intro: ['Welcome text', 'Texto de bienvenida'],
  locations: ['Locations', 'Locales'],
  clubStrip: ['Dogs band', 'Franja de perros'],
  featuredMenu: ['Featured products', 'Productos destacados'],
  gallery: ['Photo gallery', 'Galería de fotos'],
  testimonials: ['Testimonials', 'Testimonios'],
  cta: ['Call to action', 'Llamada a la acción'],
  richText: ['Text block', 'Bloque de texto'],
  frames: ['Gold frames', 'Marcos dorados'],
  form: ['Form', 'Formulario'],
  spacer: ['Space', 'Espacio'],
}

/** Page sections: number · type · a hint of the content · "hidden" when switched off. */
export const BlockLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Json>()
  const L = (pair: [string, string]) => (es() ? pair[1] : pair[0])
  const type = String(data?.blockType ?? '')
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const count = (v: unknown, one: [string, string], many: [string, string]) => (Array.isArray(v) && v.length ? `${v.length} ${L(v.length === 1 ? one : many)}` : '')
  const hint =
    snippet(data?.blockName) ||
    (type === 'locations' ? count(data?.items, ['location', 'local'], ['locations', 'locales']) : '') ||
    snippet(data?.title) ||
    snippet(data?.text) ||
    snippet(data?.html) ||
    (type === 'hero' ? count(data?.slides, ['photo', 'foto'], ['photos', 'fotos']) : '') ||
    (type === 'locations' ? count(data?.items, ['location', 'local'], ['locations', 'locales']) : '') ||
    (type === 'frames' ? count(data?.items, ['frame', 'marco'], ['frames', 'marcos']) : '') ||
    (type === 'form' ? L(data?.form === 'careers' ? ['Join our team', 'Únete al equipo'] : ['Contact us', 'Contacto']) : '')
  const hidden = data?.enabled === false
  return (
    <span className={`bb-rowlabel${hidden ? ' bb-rowlabel--off' : ''}`}>
      <span className="bb-rowlabel__num">{n}</span>
      <span className="bb-rowlabel__pill">{BLOCK_LABELS[type] ? L(BLOCK_LABELS[type]) : type}</span>
      {hint ? <span className="bb-rowlabel__main">{hint}</span> : null}
      {hidden ? <span className="bb-rowlabel__extra">{L(['hidden', 'oculta'])}</span> : null}
    </span>
  )
}
