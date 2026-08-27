import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Textarea, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import {
  portfolioSettingsSchema,
  type PortfolioSettingsValues,
} from '../validation/portfolioSettingsSchema'
import type { PortfolioSettingsRow } from '../types'

export interface PortfolioSettingsFormProps {
  initialValues: PortfolioSettingsRow | null
  onSubmit: (values: PortfolioSettingsValues) => Promise<void>
  isSubmitting: boolean
}

export function PortfolioSettingsForm({
  initialValues,
  onSubmit,
  isSubmitting,
}: PortfolioSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioSettingsValues>({
    resolver: zodResolver(portfolioSettingsSchema),
    defaultValues: {
      contact_email: initialValues?.contact_email ?? '',
      contact_phone: initialValues?.contact_phone ?? '',
      address_en: initialValues?.address_en ?? '',
      address_hi: initialValues?.address_hi ?? '',
      google_map_url: initialValues?.google_map_url ?? '',
      copyright_text_en: initialValues?.copyright_text_en ?? '',
      copyright_text_hi: initialValues?.copyright_text_hi ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="contact_email"
          label="Contact email"
          error={errors.contact_email?.message}
        >
          <Input id="contact_email" type="email" {...register('contact_email')} />
        </FormField>
        <FormField
          htmlFor="contact_phone"
          label="Contact phone"
          error={errors.contact_phone?.message}
        >
          <Input id="contact_phone" {...register('contact_phone')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="address_en"
          label="Address (English)"
          error={errors.address_en?.message}
        >
          <Textarea id="address_en" rows={3} {...register('address_en')} />
        </FormField>
        <FormField
          htmlFor="address_hi"
          label="Address (Hindi)"
          error={errors.address_hi?.message}
        >
          <Textarea id="address_hi" rows={3} {...register('address_hi')} />
        </FormField>
      </div>

      <FormField
        htmlFor="google_map_url"
        label="Google Maps URL"
        error={errors.google_map_url?.message}
      >
        <Input id="google_map_url" {...register('google_map_url')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="copyright_text_en"
          label="Copyright text (English)"
          error={errors.copyright_text_en?.message}
        >
          <Input id="copyright_text_en" {...register('copyright_text_en')} />
        </FormField>
        <FormField
          htmlFor="copyright_text_hi"
          label="Copyright text (Hindi)"
          error={errors.copyright_text_hi?.message}
        >
          <Input id="copyright_text_hi" {...register('copyright_text_hi')} />
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Save settings
        </Button>
      </div>
    </form>
  )
}
