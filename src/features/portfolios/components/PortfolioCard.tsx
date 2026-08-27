import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import type { Portfolio } from '../types'

export interface PortfolioCardProps {
  portfolio: Portfolio
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  return (
    <Link
      to={ROUTES.portfolios.detail(portfolio.id)}
      className="block rounded-lg transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{portfolio.full_name_en}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {portfolio.full_name_hi}
          </p>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {portfolio.designation_en ?? '—'}
          </span>
          <span
            className={
              portfolio.status === 'active'
                ? 'rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground'
                : 'rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
            }
          >
            {portfolio.status}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
