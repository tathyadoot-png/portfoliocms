import { PageHeader } from '@/shared/components/layout'
import { EmptyState } from '@/shared/components/feedback'
import { useActivePortfolio } from '@/features/portfolios'

export function SeoPage() {
  const portfolio = useActivePortfolio()
  return (
    <div>
      <PageHeader
        title="SEO"
        description={`Search & social metadata for ${portfolio.full_name_en}.`}
      />
      <EmptyState
        title="Coming in a later phase"
        description="Bilingual meta titles/descriptions and OG image selection will be built next."
      />
    </div>
  )
}
