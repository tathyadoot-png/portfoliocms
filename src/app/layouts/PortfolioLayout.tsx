import { Navigate, Outlet } from 'react-router-dom'
import {
  Home,
  User,
  Settings,
  CalendarDays,
  Images,
  Share2,
  Search,
  Cloud,
} from 'lucide-react'
import { TabNav, type NavItem } from '@/shared/components/layout'
import { ErrorState, LoadingState } from '@/shared/components/feedback'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import {
  ActivePortfolioProvider,
  usePortfolioQuery,
  useActivePortfolioId,
} from '@/features/portfolios'

/**
 * Resolves the active portfolio from the :portfolioId URL segment, provides it
 * via context, and renders the portfolio sub-navigation. Every child feature
 * page gets the active portfolio for free — no re-fetch, no prop drilling.
 */
export function PortfolioLayout() {
  const portfolioId = useActivePortfolioId()
  const { data, isLoading, isError, error, refetch } =
    usePortfolioQuery(portfolioId)

  if (isLoading) {
    return <LoadingState message="Loading portfolio…" />
  }

  if (isError) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    )
  }

  if (!data) {
    return <Navigate to={ROUTES.portfolios.root} replace />
  }

  const tabs: NavItem[] = [
    {
      to: ROUTES.portfolios.detail(portfolioId),
      label: 'Overview',
      icon: Home,
      end: true,
    },
    { to: ROUTES.portfolios.profile(portfolioId), label: 'Profile', icon: User },
    {
      to: ROUTES.portfolios.settings(portfolioId),
      label: 'Settings',
      icon: Settings,
    },
    {
      to: ROUTES.portfolios.activities(portfolioId),
      label: 'Activities',
      icon: CalendarDays,
    },
    { to: ROUTES.portfolios.media(portfolioId), label: 'Media', icon: Images },
    {
      to: ROUTES.portfolios.socialLinks(portfolioId),
      label: 'Social',
      icon: Share2,
    },
    { to: ROUTES.portfolios.seo(portfolioId), label: 'SEO', icon: Search },
    {
      to: ROUTES.portfolios.cloudinarySettings(portfolioId),
      label: 'Cloudinary',
      icon: Cloud,
    },
  ]

  return (
    <ActivePortfolioProvider portfolio={data}>
      <div className="mb-6">
        <TabNav items={tabs} />
      </div>
      <Outlet />
    </ActivePortfolioProvider>
  )
}
