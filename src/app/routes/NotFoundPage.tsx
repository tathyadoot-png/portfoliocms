import { Link } from 'react-router-dom'
import { buttonVariants } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { cn } from '@/shared/utils'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-semibold text-foreground">404</p>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link
        to={ROUTES.portfolios.root}
        className={cn(buttonVariants({ variant: 'outline' }))}
      >
        Back to portfolios
      </Link>
    </div>
  )
}
