import type { ReactNode } from 'react'

export interface TopbarProps {
  left?: ReactNode
  right?: ReactNode
}

/** Presentational top bar with left/right slots. */
export function Topbar({ left, right }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </header>
  )
}
