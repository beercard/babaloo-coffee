'use client'
import React from 'react'
import { FieldDescription, FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/** Colour swatch + hex input. Empty value = use the website's default colour (shown as placeholder). */
export const ColorField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const placeholder = (field.admin?.placeholder as string | undefined) ?? ''
  const current = value || placeholder || '#000000'
  return (
    <div className="field-type bb-color">
      <FieldLabel label={field.label} path={path} />
      <div className="bb-color__row">
        <input type="color" className="bb-color__swatch" value={/^#[0-9a-f]{6}$/i.test(current) ? current : '#000000'} onChange={(e) => setValue(e.target.value)} aria-label="Pick a colour" />
        <input type="text" className="bb-color__hex" value={value ?? ''} placeholder={placeholder} onChange={(e) => setValue(e.target.value.trim())} maxLength={7} />
        {value ? (
          <button type="button" className="bb-color__reset" onClick={() => setValue('')}>
            ↺ default
          </button>
        ) : null}
      </div>
      {showError && errorMessage ? <p className="bb-color__error">{errorMessage}</p> : null}
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
