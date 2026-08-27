/**
 * Query key factory for social links. ALWAYS portfolio-scoped so switching
 * portfolios never leaks another portfolio's cached links.
 */
export const socialLinkKeys = {
  all: (portfolioId: string) => ['social-links', portfolioId] as const,
  lists: (portfolioId: string) =>
    [...socialLinkKeys.all(portfolioId), 'list'] as const,
  list: (portfolioId: string) =>
    [...socialLinkKeys.lists(portfolioId)] as const,
  details: (portfolioId: string) =>
    [...socialLinkKeys.all(portfolioId), 'detail'] as const,
  detail: (portfolioId: string, id: string) =>
    [...socialLinkKeys.details(portfolioId), id] as const,
}
