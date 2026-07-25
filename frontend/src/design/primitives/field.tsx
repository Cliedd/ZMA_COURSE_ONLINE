import { cloneElement, useId } from 'react'
import type { ReactElement } from 'react'
import { cn } from '@/lib/cn'

export interface FieldProps {
  name: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactElement
}

/**
 * Câble l'accessibilité du champ à sa place : htmlFor, id, aria-invalid,
 * aria-describedby et role="alert". Aucun appelant n'a à y penser.
 */
export function Field({ name, label, error, hint, required, className, children }: FieldProps) {
  const generated = useId()
  const inputId = `${name}-${generated}`
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="font-sans text-sm font-medium text-ink">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-danger">*</span>}
      </label>

      {cloneElement(children, {
        id: inputId,
        name,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}

      {error ? (
        <p id={errorId} role="alert" className="font-sans text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="font-sans text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
