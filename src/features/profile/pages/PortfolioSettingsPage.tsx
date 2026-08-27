import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui'
import { ErrorState, LoadingState } from '@/shared/components/feedback'
import { getErrorMessage } from '@/shared/utils'
import { useActivePortfolio } from '@/features/portfolios'
import { useCloudinaryConfigQuery } from '@/features/cloudinary-settings'
import { PortfolioSettingsForm } from '../components/PortfolioSettingsForm'
import { FaviconManager } from '../components/FaviconManager'
import { usePortfolioSettingsQuery } from '../hooks/usePortfolioSettingsQuery'
import { useUpsertPortfolioSettingsMutation } from '../hooks/useUpsertPortfolioSettingsMutation'
import type { PortfolioSettingsValues } from '../validation/portfolioSettingsSchema'

export function PortfolioSettingsPage() {
  const portfolio = useActivePortfolio()
  const { data, isLoading, isError, error, refetch } = usePortfolioSettingsQuery(
    portfolio.id,
  )
  const { mutateAsync, isPending } = useUpsertPortfolioSettingsMutation(
    portfolio.id,
  )
  const { data: cloudinaryConfigRow } = useCloudinaryConfigQuery(portfolio.id)

  const cloudinaryConfig = cloudinaryConfigRow
    ? {
        cloudName: cloudinaryConfigRow.cloud_name,
        uploadPreset: cloudinaryConfigRow.upload_preset,
        defaultFolder: cloudinaryConfigRow.default_folder,
      }
    : null

  const handleSubmit = async (values: PortfolioSettingsValues) => {
    try {
      await mutateAsync(values)
      toast.success('Settings saved')
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Portfolio settings"
        description={`Contact, address, and branding for ${portfolio.full_name_en}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Favicon</CardTitle>
        </CardHeader>
        <CardContent>
          <FaviconManager portfolioId={portfolio.id} cloudinaryConfig={cloudinaryConfig} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & legal</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingState /> : null}
          {isError ? (
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : null}
          {!isLoading && !isError ? (
            <PortfolioSettingsForm
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
