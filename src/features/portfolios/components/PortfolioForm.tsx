import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import { slugify } from '@/shared/utils'
import { DEFAULT_THEME } from '../constants'
import {
  createPortfolioSchema,
  type CreatePortfolioValues,
} from '../validation/portfolioSchema'

export interface PortfolioFormProps {
  onSubmit: (values: CreatePortfolioValues) => Promise<void>
  isSubmitting: boolean
}

export function PortfolioForm({ onSubmit, isSubmitting }: PortfolioFormProps) {
  const [slugEdited, setSlugEdited] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreatePortfolioValues>({
    resolver: zodResolver(createPortfolioSchema),
    defaultValues: {
      full_name_en: '',
      full_name_hi: '',
      slug: '',
      designation_en: '',
      designation_hi: '',
      theme: DEFAULT_THEME,
    },
  })

  // Keep slug auto-derived from the English name until the user edits it manually.
  const nameField = register('full_name_en')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor="full_name_en"
          label="Full name (English)"
          required
          error={errors.full_name_en?.message}
        >
          <Input
            id="full_name_en"
            {...nameField}
            onChange={(event) => {
              nameField.onChange(event)
              if (!slugEdited) {
                setValue('slug', slugify(event.target.value), {
                  shouldValidate: true,
                })
              }
            }}
          />
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

      <FormField
        htmlFor="slug"
        label="Slug"
        required
        hint="Used in the public URL. Auto-filled from the English name."
        error={errors.slug?.message}
      >
        <Input
          id="slug"
          {...register('slug')}
          onInput={() => setSlugEdited(true)}
        />
      </FormField>

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

      <input type="hidden" {...register('theme')} />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Create portfolio
        </Button>
      </div>
    </form>
  )
}
