import { Link } from 'react-router-dom'
import { buttonVariants } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { cn } from '@/shared/utils'

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-2xl font-semibold text-foreground">Not authorized</p>
      <p className="text-muted-foreground">
        You don&apos;t have access to this page.
      </p>
      <Link to={ROUTES.login} className={cn(buttonVariants({ variant: 'outline' }))}>
        Back to sign in
      </Link>
    </div>
  )
}
