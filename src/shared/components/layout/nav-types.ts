import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon?: ComponentType<{ className?: string }>
  /** Match the path exactly (react-router NavLink `end`). */
  end?: boolean
}
