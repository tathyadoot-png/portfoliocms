import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui'
import { getErrorMessage } from '@/shared/utils'
import {
  useActivePortfolio,
  useUpdatePortfolioMutation,
  type UpdatePortfolioValues,
} from '@/features/portfolios'
import { useCloudinaryConfigQuery } from '@/features/cloudinary-settings'
import { RoleImageManager } from '@/features/media'
import { PortfolioProfileForm } from '../components/PortfolioProfileForm'

export function ProfilePage() {
  const portfolio = useActivePortfolio()
  const { mutateAsync, isPending } = useUpdatePortfolioMutation(portfolio.id)
  const { data: cloudinaryConfigRow } = useCloudinaryConfigQuery(portfolio.id)

  const cloudinaryConfig = cloudinaryConfigRow
    ? {
        cloudName: cloudinaryConfigRow.cloud_name,
        uploadPreset: cloudinaryConfigRow.upload_preset,
        defaultFolder: cloudinaryConfigRow.default_folder,
      }
    : null

  const handleSubmit = async (values: UpdatePortfolioValues) => {
    try {
      await mutateAsync(values)
      toast.success('Profile saved')
    } catch (error) {
      const message = getErrorMessage(error)
      if (message.toLowerCase().includes('duplicate')) {
        toast.error('This slug is already in use. Choose a different one.')
      } else {
        toast.error(message)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description={`Basic profile for ${portfolio.full_name_en}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row">
          <RoleImageManager
            portfolioId={portfolio.id}
            role="profile"
            cloudinaryConfig={cloudinaryConfig}
            label="Profile image"
            aspectClassName="aspect-square max-w-[12rem]"
          />
          <RoleImageManager
            portfolioId={portfolio.id}
            role="cover"
            cloudinaryConfig={cloudinaryConfig}
            label="Cover image"
            aspectClassName="aspect-video max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioProfileForm
            portfolio={portfolio}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
