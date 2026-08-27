import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { FullPageLoader } from '@/shared/components/feedback'
import { ROUTES } from '@/shared/constants'

/**
 * Session gate. Blocks until the initial session resolves, then either renders
 * the protected tree or redirects to /login (remembering where the user was
 * headed). This is a UX guard only — RLS is the real security boundary.
 */
export function ProtectedLayout() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullPageLoader message="Loading…" />
  }

  if (!session) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
