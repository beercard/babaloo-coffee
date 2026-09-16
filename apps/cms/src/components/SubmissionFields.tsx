'use client'
import React from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

/**
 * Friendly view of a form submission: the raw JSON of `data` is shown as a tidy
 * label / value list, with mail, phone and résumé links. Read-only.
 */
const LABELS: Record<string, [string, string]> = {
  name: ['Name', 'Nombre'],
  firstName: ['First name', 'Nombre'],
  lastName: ['Last name', 'Apellido'],
  email: ['Email', 'Correo'],
  phone: ['Phone', 'Teléfono'],
  position: ['Position', 'Puesto'],
  experience: ['Experience', 'Experiencia'],
  message: ['Message', 'Mensaje'],
  resume: ['Résumé', 'Currículum'],
  resumeUrl: ['Résumé link', 'Enlace al currículum'],
}
const ORDER = Object.keys(LABELS)

export const SubmissionFields: React.FC<{ path: string }> = ({ path }) => {
  const { value } = useField<Record<string, string>>({ path })
  const saved = useFormFields(([fields]) => fields.labels?.value as Record<string, string> | undefined)
  const resume = useFormFields(([fields]) => fields.resume?.value as number | string | { id?: number | string; url?: string; filename?: string } | undefined)
  const es = typeof navigator !== 'undefined' && document.cookie.includes('payload-lng=es')
  const data = value && typeof value === 'object' ? value : {}
  const savedOrder = saved && typeof saved === 'object' ? Object.keys(saved) : []
  const order = savedOrder.length ? savedOrder : ORDER
  const keys = [...order.filter((k) => k in data), ...Object.keys(data).filter((k) => !order.includes(k))].filter((k) => String(data[k] ?? '').trim() !== '')
  const resumeId = resume && typeof resume === 'object' ? resume.id : resume
  const resumeUrl = resume && typeof resume === 'object' && resume.url ? resume.url : resumeId ? `/api/resumes/${resumeId}` : undefined

  return (
    <div className="bb-submission">
      {keys.length === 0 && <p className="bb-submission__empty">{es ? 'Sin datos' : 'No data'}</p>}
      {keys.map((k) => {
        const v = String(data[k])
        const label = saved?.[k] || (LABELS[k] ? (es ? LABELS[k][1] : LABELS[k][0]) : k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()))
        let body: React.ReactNode = v
        if (k === 'email') body = <a href={`mailto:${v}`}>{v}</a>
        else if (k === 'phone') body = <a href={`tel:${v.replace(/[^+\d]/g, '')}`}>{v}</a>
        else if (k === 'resumeUrl') body = <a href={v} target="_blank" rel="noopener">{v}</a>
        else if (k === 'resume') body = resumeUrl ? <a href={resumeUrl} target="_blank" rel="noopener">{v} ↗</a> : v
        else if (k === 'message') body = <span className="bb-submission__message">{v}</span>
        return (
          <div className="bb-submission__row" key={k}>
            <span className="bb-submission__label">{label}</span>
            <span className="bb-submission__value">{body}</span>
          </div>
        )
      })}
    </div>
  )
}
