import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/shared/utils'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-foreground',
        className,
      )}
      {...props}
    />
  )
}
