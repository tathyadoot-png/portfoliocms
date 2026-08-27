import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import { Card, CardContent } from '@/shared/components/ui'
import { ErrorState, LoadingState } from '@/shared/components/feedback'
import { getErrorMessage } from '@/shared/utils'
import { useActivePortfolio } from '@/features/portfolios'
import { CloudinaryConfigForm } from '../components/CloudinaryConfigForm'
import { useCloudinaryConfigQuery } from '../hooks/useCloudinaryConfigQuery'
import { useUpsertCloudinaryConfigMutation } from '../hooks/useUpsertCloudinaryConfigMutation'
import type { CloudinaryConfigValues } from '../validation/cloudinaryConfigSchema'

export function CloudinarySettingsPage() {
  const portfolio = useActivePortfolio()
  const { data, isLoading, isError, error, refetch } = useCloudinaryConfigQuery(
    portfolio.id,
  )
  const { mutateAsync, isPending } = useUpsertCloudinaryConfigMutation(
    portfolio.id,
  )

  const handleSubmit = async (values: CloudinaryConfigValues) => {
    try {
      await mutateAsync(values)
      toast.success('Cloudinary settings saved')
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Cloudinary settings"
        description={`Unsigned direct-upload configuration for ${portfolio.full_name_en}. Each portfolio uses its own Cloudinary account — no API secret is stored or used.`}
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <LoadingState /> : null}
          {isError ? (
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : null}
          {!isLoading && !isError ? (
            <CloudinaryConfigForm
              initialValues={data ?? null}
              onSubmit={handleSubmit}
              isSubmitting={isPending}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
