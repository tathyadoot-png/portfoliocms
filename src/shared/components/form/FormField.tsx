import type { ReactNode } from 'react'
import { Label } from '@/shared/components/ui'
import { cn } from '@/shared/utils'

export interface FormFieldProps {
  /** id of the control this label points at (for accessibility). */
  htmlFor: string
  label: string
  error?: string
  required?: boolean
  hint?: string
  className?: string
  children: ReactNode
}

/**
 * Presentational label + control + error wrapper. Feature-agnostic: it does not
 * know about React Hook Form; forms pass the control and any error string.
 */
export function FormField({
  htmlFor,
  label,
  error,
  required,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
