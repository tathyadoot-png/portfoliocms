import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils'
import { buttonVariants, type ButtonVariantProps } from './button-variants'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
