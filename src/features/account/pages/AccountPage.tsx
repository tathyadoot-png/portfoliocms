import { PageHeader } from '@/shared/components/layout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui'
import { useAuth } from '@/features/auth'

export function AccountPage() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Account" description="Your CMS account." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {user?.email ?? '—'}
        </CardContent>
      </Card>
    </div>
  )
}
