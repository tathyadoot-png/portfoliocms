/**
 * Central path builders. The URL is the source of truth for the active
 * portfolio, so every portfolio-scoped path is derived from a portfolioId
 * here rather than being assembled ad hoc across the app.
 */
export const ROUTES = {
  login: '/login',
  unauthorized: '/unauthorized',
  account: '/account',
  portfolios: {
    root: '/portfolios',
    new: '/portfolios/new',
    detail: (portfolioId: string) => `/portfolios/${portfolioId}`,
    profile: (portfolioId: string) => `/portfolios/${portfolioId}/profile`,
    settings: (portfolioId: string) => `/portfolios/${portfolioId}/settings`,
    activities: (portfolioId: string) =>
      `/portfolios/${portfolioId}/activities`,
    activityNew: (portfolioId: string) =>
      `/portfolios/${portfolioId}/activities/new`,
    activity: (portfolioId: string, activityId: string) =>
      `/portfolios/${portfolioId}/activities/${activityId}`,
    media: (portfolioId: string) => `/portfolios/${portfolioId}/media`,
    socialLinks: (portfolioId: string) =>
      `/portfolios/${portfolioId}/social-links`,
    seo: (portfolioId: string) => `/portfolios/${portfolioId}/seo`,
    cloudinarySettings: (portfolioId: string) =>
      `/portfolios/${portfolioId}/settings/cloudinary`,
  },
} as const
