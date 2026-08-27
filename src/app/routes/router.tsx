import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  RootLayout,
  AuthLayout,
  ProtectedLayout,
  DashboardLayout,
  PortfolioLayout,
} from '@/app/layouts'
import { ROUTES } from '@/shared/constants'
import { LoginPage } from '@/features/auth'
import {
  PortfolioListPage,
  PortfolioCreatePage,
  PortfolioOverviewPage,
} from '@/features/portfolios'
import { ProfilePage, PortfolioSettingsPage } from '@/features/profile'
import {
  ActivitiesPage,
  ActivityCreatePage,
  ActivityEditPage,
} from '@/features/activities'
import { MediaPage } from '@/features/media'
import { SocialLinksPage } from '@/features/social-links'
import { SeoPage } from '@/features/seo'
import { CloudinarySettingsPage } from '@/features/cloudinary-settings'
import { AccountPage } from '@/features/account'
import { NotFoundPage } from './NotFoundPage'
import { UnauthorizedPage } from './UnauthorizedPage'

/**
 * Route tree implementing the approved deep-link structure. The :portfolioId
 * segment lives in the URL (not just context) so portfolio selection is
 * deep-linkable, back/forward-safe, and multi-tab safe. Static segments
 * (portfolios/new) are declared before the dynamic :portfolioId route.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
      },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <Navigate to={ROUTES.portfolios.root} replace />,
              },
              { path: 'portfolios', element: <PortfolioListPage /> },
              { path: 'portfolios/new', element: <PortfolioCreatePage /> },
              { path: 'account', element: <AccountPage /> },
              {
                path: 'portfolios/:portfolioId',
                element: <PortfolioLayout />,
                children: [
                  { index: true, element: <PortfolioOverviewPage /> },
                  { path: 'profile', element: <ProfilePage /> },
                  { path: 'settings', element: <PortfolioSettingsPage /> },
                  { path: 'activities', element: <ActivitiesPage /> },
                  { path: 'activities/new', element: <ActivityCreatePage /> },
                  {
                    path: 'activities/:activityId',
                    element: <ActivityEditPage />,
                  },
                  { path: 'media', element: <MediaPage /> },
                  { path: 'social-links', element: <SocialLinksPage /> },
                  { path: 'seo', element: <SeoPage /> },
                  {
                    path: 'settings/cloudinary',
                    element: <CloudinarySettingsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
