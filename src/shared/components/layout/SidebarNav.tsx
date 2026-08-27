import { NavLink } from 'react-router-dom'
import type { NavItem } from './nav-types'
import { cn } from '@/shared/utils'

export interface SidebarNavProps {
  items: NavItem[]
}

/** Vertical navigation list. Feature-agnostic — it renders the items it's given. */
export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
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
