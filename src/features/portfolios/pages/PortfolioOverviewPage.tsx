import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui'
import { PageHeader } from '@/shared/components/layout'
import { ROUTES } from '@/shared/constants'
import { useActivePortfolio } from '../hooks/useActivePortfolio'

export function PortfolioOverviewPage() {
  const portfolio = useActivePortfolio()

  const sections = [
    { label: 'Profile', to: ROUTES.portfolios.profile(portfolio.id) },
    { label: 'Settings', to: ROUTES.portfolios.settings(portfolio.id) },
    { label: 'Activities', to: ROUTES.portfolios.activities(portfolio.id) },
    { label: 'Media', to: ROUTES.portfolios.media(portfolio.id) },
    { label: 'Social links', to: ROUTES.portfolios.socialLinks(portfolio.id) },
    { label: 'SEO', to: ROUTES.portfolios.seo(portfolio.id) },
    {
      label: 'Cloudinary',
      to: ROUTES.portfolios.cloudinarySettings(portfolio.id),
    },
  ]

  return (
    <div>
      <PageHeader
        title={portfolio.full_name_en}
        description={portfolio.designation_en ?? portfolio.full_name_hi}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.to} to={section.to} className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{section.label}</CardTitle>
                <CardDescription>Manage {section.label.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Open →
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
