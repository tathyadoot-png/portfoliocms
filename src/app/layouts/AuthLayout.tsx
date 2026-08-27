import { Outlet } from 'react-router-dom'

/** Centered shell for unauthenticated screens (login). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Outlet />
    </div>
  )
}
