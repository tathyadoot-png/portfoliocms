import { useParams } from 'react-router-dom'

/**
 * Resolves the active portfolio id from the URL. The URL — not React state — is
 * the source of truth for which portfolio is active. Only valid inside a
 * `:portfolioId` route.
 */
export function useActivePortfolioId(): string {
  const { portfolioId } = useParams<{ portfolioId: string }>()
  if (!portfolioId) {
    throw new Error(
      'useActivePortfolioId must be used within a /:portfolioId route',
    )
  }
  return portfolioId
}
