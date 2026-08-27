import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import { SOCIAL_PLATFORMS, SOCIAL_PLATFORM_LABELS } from '../constants'
import {
  socialLinkFormSchema,
  type SocialLinkFormValues,
} from '../validation/socialLinkSchema'

export interface SocialLinkFormProps {
  defaultValues: SocialLinkFormValues
  onSubmit: (values: SocialLinkFormValues) => Promise<void>
  onCancel?: () => void
  isSubmitting: boolean
  submitLabel: string
}

export function SocialLinkForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: SocialLinkFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialLinkFormValues>({
    resolver: zodResolver(socialLinkFormSchema),
    defaultValues,
  })

  const platform = useWatch({ control, name: 'platform' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="platform"
          label="Platform"
          required
          error={errors.platform?.message}
        >
          <select
            id="platform"
            {...register('platform')}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SOCIAL_PLATFORMS.map((value) => (
              <option key={value} value={value}>
                {SOCIAL_PLATFORM_LABELS[value]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          htmlFor="url"
          label="URL"
          required
          error={errors.url?.message}
        >
          <Input
            id="url"
            type="url"
            placeholder="https://"
            {...register('url')}
          />
        </FormField>
      </div>

      {platform === 'other' ? (
        <FormField
          htmlFor="custom_label"
          label="Custom label"
          required
          hint="Shown instead of a platform name."
          error={errors.custom_label?.message}
        >
          <Input id="custom_label" {...register('custom_label')} />
        </FormField>
      ) : (
        <input type="hidden" {...register('custom_label')} />
      )}

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input"
          {...register('is_visible')}
        />
        Visible on the public site
      </label>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
