/** Query key factory for portfolio_settings. Always portfolio-scoped. */
export const portfolioSettingsKeys = {
  all: (portfolioId: string) => ['portfolio-settings', portfolioId] as const,
  detail: (portfolioId: string) =>
    [...portfolioSettingsKeys.all(portfolioId), 'detail'] as const,
}
