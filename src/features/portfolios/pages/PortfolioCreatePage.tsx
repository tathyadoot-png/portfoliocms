import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import { Card, CardContent } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import { PortfolioForm } from '../components/PortfolioForm'
import { useCreatePortfolioMutation } from '../hooks/useCreatePortfolioMutation'
import type { CreatePortfolioValues } from '../validation/portfolioSchema'

export function PortfolioCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreatePortfolioMutation()

  const handleSubmit = async (values: CreatePortfolioValues) => {
    try {
      const portfolio = await mutateAsync(values)
      toast.success('Portfolio created')
      navigate(ROUTES.portfolios.detail(portfolio.id))
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={ROUTES.portfolios.root}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to portfolios
      </Link>

      <PageHeader
        title="New portfolio"
        description="Create a portfolio. You can complete the profile, media, and SEO afterwards."
      />

      <Card>
        <CardContent className="pt-6">
          <PortfolioForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  )
}
