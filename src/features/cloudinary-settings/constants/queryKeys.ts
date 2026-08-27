/** Query key factory for per-portfolio Cloudinary config. Always portfolio-scoped. */
export const cloudinaryKeys = {
  all: (portfolioId: string) => ['cloudinary', portfolioId] as const,
  detail: (portfolioId: string) =>
    [...cloudinaryKeys.all(portfolioId), 'detail'] as const,
}
