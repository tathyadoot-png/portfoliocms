import { useState } from 'react'
import { Link2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '@/shared/components/layout'
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui'
import { getErrorMessage } from '@/shared/utils'
import { useActivePortfolio } from '@/features/portfolios'
import { SocialLinkForm } from '../components/SocialLinkForm'
import { SocialLinkCard } from '../components/SocialLinkCard'
import { useSocialLinksQuery } from '../hooks/useSocialLinksQuery'
import { useCreateSocialLinkMutation } from '../hooks/useCreateSocialLinkMutation'
import { useUpdateSocialLinkMutation } from '../hooks/useUpdateSocialLinkMutation'
import { useDeleteSocialLinkMutation } from '../hooks/useDeleteSocialLinkMutation'
import { useToggleSocialLinkVisibilityMutation } from '../hooks/useToggleSocialLinkVisibilityMutation'
import { useReorderSocialLinksMutation } from '../hooks/useReorderSocialLinksMutation'
import { toFormValues, toWriteInput } from '../utils/form'
import type { SocialLinkFormValues } from '../validation/socialLinkSchema'

export function SocialLinksPage() {
  const portfolio = useActivePortfolio()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useSocialLinksQuery(
    portfolio.id,
  )
  const createMutation = useCreateSocialLinkMutation(portfolio.id)
  const updateMutation = useUpdateSocialLinkMutation(portfolio.id)
  const deleteMutation = useDeleteSocialLinkMutation(portfolio.id)
  const visibilityMutation = useToggleSocialLinkVisibilityMutation(
    portfolio.id,
  )
  const reorderMutation = useReorderSocialLinksMutation(portfolio.id)

  const links = data ?? []
  const editingLink = links.find((link) => link.id === editingId) ?? null
  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    visibilityMutation.isPending ||
    reorderMutation.isPending

  const handleCreate = async (values: SocialLinkFormValues) => {
    try {
      await createMutation.mutateAsync(toWriteInput(values))
      toast.success('Social link added')
      setIsCreating(false)
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    }
  }

  const handleUpdate = async (values: SocialLinkFormValues) => {
    if (!editingId) return
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        input: toWriteInput(values),
      })
      toast.success('Social link updated')
      setEditingId(null)
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Social link deleted')
      if (editingId === deleteId) setEditingId(null)
      setDeleteId(null)
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    }
  }

  const move = async (id: string, direction: -1 | 1) => {
    const ids = links.map((link) => link.id)
    const index = ids.indexOf(id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return
    const swapped = [...ids]
    const current = swapped[index]
    swapped[index] = swapped[nextIndex]
    swapped[nextIndex] = current
    try {
      await reorderMutation.mutateAsync(swapped)
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    }
  }

  return (
    <div>
      <PageHeader
        title="Social links"
        description={`Social and external links for ${portfolio.full_name_en}.`}
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditingId(null)
              setIsCreating(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add link
          </Button>
        }
      />

      {isCreating || editingLink ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {editingLink ? 'Edit link' : 'New link'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SocialLinkForm
              key={editingLink?.id ?? 'new'}
              defaultValues={toFormValues(editingLink)}
              onSubmit={editingLink ? handleUpdate : handleCreate}
              onCancel={() => {
                setIsCreating(false)
                setEditingId(null)
              }}
              isSubmitting={
                editingLink ? updateMutation.isPending : createMutation.isPending
              }
              submitLabel={editingLink ? 'Save link' : 'Add link'}
            />
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? <LoadingState /> : null}

      {isError ? (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && links.length === 0 && !isCreating ? (
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title="No social links yet"
          description="Add Facebook, Instagram, YouTube, or any external URL for this portfolio."
          action={
            <Button type="button" onClick={() => setIsCreating(true)}>
              Add the first link
            </Button>
          }
        />
      ) : null}

      {!isError && links.length > 0 ? (
        <div className="flex flex-col gap-3">
          {links.map((link, index) => (
            <SocialLinkCard
              key={link.id}
              link={link}
              isFirst={index === 0}
              isLast={index === links.length - 1}
              isBusy={isBusy}
              onEdit={() => {
                setIsCreating(false)
                setEditingId(link.id)
              }}
              onDelete={() => setDeleteId(link.id)}
              onToggleVisibility={() => {
                void visibilityMutation
                  .mutateAsync({
                    id: link.id,
                    isVisible: !link.is_visible,
                  })
                  .then(() =>
                    toast.success(
                      link.is_visible ? 'Link hidden' : 'Link visible',
                    ),
                  )
                  .catch((toggleError) =>
                    toast.error(getErrorMessage(toggleError)),
                  )
              }}
              onMoveUp={() => void move(link.id, -1)}
              onMoveDown={() => void move(link.id, 1)}
            />
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this social link?"
        description="This permanently removes the link. It cannot be restored."
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteMutation.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
