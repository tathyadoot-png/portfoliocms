import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import {
  cloudinaryConfigSchema,
  type CloudinaryConfigValues,
} from '../validation/cloudinaryConfigSchema'
import type { CloudinaryConfigRow } from '../types'

export interface CloudinaryConfigFormProps {
  initialValues: CloudinaryConfigRow | null
  onSubmit: (values: CloudinaryConfigValues) => Promise<void>
  isSubmitting: boolean
}

export function CloudinaryConfigForm({
  initialValues,
  onSubmit,
  isSubmitting,
}: CloudinaryConfigFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CloudinaryConfigValues>({
    resolver: zodResolver(cloudinaryConfigSchema),
    defaultValues: {
      cloud_name: initialValues?.cloud_name ?? '',
      upload_preset: initialValues?.upload_preset ?? '',
      default_folder: initialValues?.default_folder ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField
        htmlFor="cloud_name"
        label="Cloud name"
        required
        hint="Found in your Cloudinary account dashboard."
        error={errors.cloud_name?.message}
      >
        <Input id="cloud_name" {...register('cloud_name')} />
      </FormField>

      <FormField
        htmlFor="upload_preset"
        label="Unsigned upload preset"
        required
        hint="Must be an unsigned preset — no API secret is ever used by this CMS."
        error={errors.upload_preset?.message}
      >
        <Input id="upload_preset" {...register('upload_preset')} />
      </FormField>

      <FormField
        htmlFor="default_folder"
        label="Default folder"
        hint="Optional. Uploads are placed here unless a feature overrides it."
        error={errors.default_folder?.message}
      >
        <Input id="default_folder" {...register('default_folder')} />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Save Cloudinary settings
        </Button>
      </div>
    </form>
  )
}
