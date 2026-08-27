import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Textarea, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import {
  updatePortfolioSchema,
  type UpdatePortfolioValues,
  type Portfolio,
  AVAILABLE_THEMES,
  PORTFOLIO_STATUSES,
} from '@/features/portfolios'

export interface PortfolioProfileFormProps {
  portfolio: Portfolio
  onSubmit: (values: UpdatePortfolioValues) => Promise<void>
  isSubmitting: boolean
}

export function PortfolioProfileForm({
  portfolio,
  onSubmit,
  isSubmitting,
}: PortfolioProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePortfolioValues>({
    resolver: zodResolver(updatePortfolioSchema),
    defaultValues: {
      full_name_en: portfolio.full_name_en,
      full_name_hi: portfolio.full_name_hi,
      designation_en: portfolio.designation_en ?? '',
      designation_hi: portfolio.designation_hi ?? '',
      about_en: portfolio.about_en ?? '',
      about_hi: portfolio.about_hi ?? '',
      slug: portfolio.slug,
      status: portfolio.status,
      theme: (portfolio.theme as UpdatePortfolioValues['theme']) ?? 'default',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="full_name_en"
          label="Full name (English)"
          required
          error={errors.full_name_en?.message}
        >
          <Input id="full_name_en" {...register('full_name_en')} />
        </FormField>
        <FormField
          htmlFor="full_name_hi"
          label="Full name (Hindi)"
          required
          error={errors.full_name_hi?.message}
        >
          <Input id="full_name_hi" {...register('full_name_hi')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="designation_en"
          label="Designation (English)"
          error={errors.designation_en?.message}
        >
          <Input id="designation_en" {...register('designation_en')} />
        </FormField>
        <FormField
          htmlFor="designation_hi"
          label="Designation (Hindi)"
          error={errors.designation_hi?.message}
        >
          <Input id="designation_hi" {...register('designation_hi')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="about_en"
          label="About (English)"
          error={errors.about_en?.message}
        >
          <Textarea id="about_en" rows={5} {...register('about_en')} />
        </FormField>
        <FormField
          htmlFor="about_hi"
          label="About (Hindi)"
          error={errors.about_hi?.message}
        >
          <Textarea id="about_hi" rows={5} {...register('about_hi')} />
        </FormField>
      </div>

      <FormField
        htmlFor="slug"
        label="Slug"
        required
        hint="Used in the public URL."
        error={errors.slug?.message}
      >
        <Input id="slug" {...register('slug')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField htmlFor="status" label="Status" required error={errors.status?.message}>
          <select
            id="status"
            {...register('status')}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PORTFOLIO_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>

        <FormField htmlFor="theme" label="Theme" required error={errors.theme?.message}>
          <select
            id="theme"
            {...register('theme')}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {AVAILABLE_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Save profile
        </Button>
      </div>
    </form>
  )
}
