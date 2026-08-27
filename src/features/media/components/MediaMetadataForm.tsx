import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import {
  mediaMetadataSchema,
  type MediaMetadataValues,
} from '../validation/mediaMetadataSchema'
import type { Media } from '../types'

export interface MediaMetadataFormProps {
  media: Media
  onSubmit: (values: MediaMetadataValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function MediaMetadataForm({
  media,
  onSubmit,
  onCancel,
  isSubmitting,
}: MediaMetadataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MediaMetadataValues>({
    resolver: zodResolver(mediaMetadataSchema),
    defaultValues: {
      alt_text_en: media.alt_text_en ?? '',
      alt_text_hi: media.alt_text_hi ?? '',
      caption_en: media.caption_en ?? '',
      caption_hi: media.caption_hi ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          htmlFor={`alt_text_en-${media.id}`}
          label="Alt text (English)"
          error={errors.alt_text_en?.message}
        >
          <Input id={`alt_text_en-${media.id}`} {...register('alt_text_en')} />
        </FormField>
        <FormField
          htmlFor={`alt_text_hi-${media.id}`}
          label="Alt text (Hindi)"
          error={errors.alt_text_hi?.message}
        >
          <Input id={`alt_text_hi-${media.id}`} {...register('alt_text_hi')} />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          htmlFor={`caption_en-${media.id}`}
          label="Caption (English)"
          error={errors.caption_en?.message}
        >
          <Input id={`caption_en-${media.id}`} {...register('caption_en')} />
        </FormField>
        <FormField
          htmlFor={`caption_hi-${media.id}`}
          label="Caption (Hindi)"
          error={errors.caption_hi?.message}
        >
          <Input id={`caption_hi-${media.id}`} {...register('caption_hi')} />
        </FormField>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : null}
          Save
        </Button>
      </div>
    </form>
  )
}
