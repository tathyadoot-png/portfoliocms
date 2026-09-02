import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Spinner,
  Textarea,
} from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import { ACTIVITY_STATUSES } from '../constants'
import {
  activityFormSchema,
  getMissingPublishFields,
  type ActivityFormValues,
} from '../validation/activitySchema'
import { ActivityCoverManager } from './ActivityCoverManager'
import { ActivityGalleryManager } from './ActivityGalleryManager'
import {
  PendingActivityMedia,
  type PendingActivityMediaValue,
} from './PendingActivityMedia'

export interface ActivityFormProps {
  portfolioId: string
  activityId?: string
  defaultValues: ActivityFormValues
  onSubmit: (
    values: ActivityFormValues,
    pendingMedia?: PendingActivityMediaValue,
  ) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
  cloudinaryConfig: {
    cloudName: string
    uploadPreset: string
    defaultFolder?: string | null
  } | null
}

export function ActivityForm({
  portfolioId,
  activityId,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  cloudinaryConfig,
}: ActivityFormProps) {
  const [pendingMedia, setPendingMedia] = useState<PendingActivityMediaValue>({
    cover: null,
    gallery: [],
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues,
  })

  const status = useWatch({ control, name: 'status' })
  const liveValues = useWatch({ control }) ?? defaultValues
  const missingForPublish =
    status === 'published' || status === 'scheduled'
      ? getMissingPublishFields(liveValues)
      : []

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(values, activityId ? undefined : pendingMedia),
      )}
      className="flex min-w-0 w-full flex-col gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">English content</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <FormField
            htmlFor="title_en"
            label="Title (English)"
            required
            error={errors.title_en?.message}
          >
            <Input id="title_en" {...register('title_en')} />
          </FormField>
          <FormField
            htmlFor="description_en"
            label="Description (English)"
            hint="Required before publishing or scheduling."
            error={errors.description_en?.message}
          >
            <Textarea
              id="description_en"
              rows={5}
              className="min-h-[8rem] max-h-80 w-full resize-y break-words"
              {...register('description_en')}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hindi content</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <FormField
            htmlFor="title_hi"
            label="Title (Hindi)"
            required
            error={errors.title_hi?.message}
          >
            <Input id="title_hi" {...register('title_hi')} />
          </FormField>
          <FormField
            htmlFor="description_hi"
            label="Description (Hindi)"
            hint="Required before publishing or scheduling."
            error={errors.description_hi?.message}
          >
            <Textarea
              id="description_hi"
              rows={5}
              className="min-h-[8rem] max-h-80 w-full resize-y break-words"
              {...register('description_hi')}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date & location</CardTitle>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="activity_date"
            label="Activity date"
            hint="The single date for this activity. Used for sorting, filtering, and public display. Required to publish."
            error={errors.activity_date?.message}
          >
            <Input
              id="activity_date"
              type="date"
              className="min-w-0"
              {...register('activity_date')}
            />
          </FormField>
          <FormField
            htmlFor="location_en"
            label="Location (English)"
            error={errors.location_en?.message}
          >
            <Input id="location_en" className="min-w-0" {...register('location_en')} />
          </FormField>
          <FormField
            htmlFor="location_hi"
            label="Location (Hindi)"
            error={errors.location_hi?.message}
          >
            <Input id="location_hi" className="min-w-0" {...register('location_hi')} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <FormField
              htmlFor="status"
              label="Status"
              required
              error={errors.status?.message}
            >
              <select
                id="status"
                {...register('status')}
                className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ACTIVITY_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              htmlFor="publish_at"
              label="Publish at"
              hint={
                status === 'scheduled'
                  ? 'Required for scheduled activities.'
                  : 'Set automatically to now if you publish without a time.'
              }
              error={errors.publish_at?.message}
            >
              <Input
                id="publish_at"
                type="datetime-local"
                className="min-w-0"
                {...register('publish_at')}
              />
            </FormField>
          </div>
          {missingForPublish.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Cannot {status} until these fields are filled:{' '}
              {missingForPublish.join(', ')}.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Media</CardTitle>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-6">
          {activityId ? (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Cover image
                </p>
                <ActivityCoverManager
                  portfolioId={portfolioId}
                  activityId={activityId}
                  cloudinaryConfig={cloudinaryConfig}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Gallery
                </p>
                <ActivityGalleryManager
                  portfolioId={portfolioId}
                  activityId={activityId}
                  cloudinaryConfig={cloudinaryConfig}
                />
              </div>
            </>
          ) : (
            <PendingActivityMedia
              value={pendingMedia}
              onChange={setPendingMedia}
              disabled={isSubmitting}
              cloudinaryConfigured={Boolean(cloudinaryConfig)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional settings</CardTitle>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              {...register('is_featured')}
            />
            Featured activity
          </label>
          <FormField
            htmlFor="sort_order"
            label="Sort order"
            hint="Stored for the public site. The CMS list is ordered by activity date."
            error={errors.sort_order?.message}
          >
            <Input
              id="sort_order"
              type="number"
              min={0}
              className="min-w-0"
              {...register('sort_order', { valueAsNumber: true })}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-stretch sm:justify-end">
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
