import { NavLink } from 'react-router-dom'
import type { NavItem } from './nav-types'
import { cn } from '@/shared/utils'

export interface TabNavProps {
  items: NavItem[]
}

/** Horizontal tab navigation, used for portfolio sub-sections. */
export function TabNav({ items }: TabNavProps) {
  return (
    <nav className="flex flex-wrap gap-1 border-b border-border">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )
          }
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
