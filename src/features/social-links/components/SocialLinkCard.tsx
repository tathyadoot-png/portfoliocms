import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button, Card, CardContent, Spinner } from '@/shared/components/ui'
import { SOCIAL_PLATFORM_LABELS } from '../constants'
import type { SocialLink } from '../types'

export interface SocialLinkCardProps {
  link: SocialLink
  isFirst: boolean
  isLast: boolean
  isBusy: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleVisibility: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function SocialLinkCard({
  link,
  isFirst,
  isLast,
  isBusy,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
}: SocialLinkCardProps) {
  const label =
    link.platform === 'other' && link.custom_label
      ? link.custom_label
      : SOCIAL_PLATFORM_LABELS[link.platform]

  return (
    <Card className={link.is_visible ? undefined : 'opacity-70'}>
      <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{label}</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
              {link.platform}
            </span>
            {link.is_visible ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                Visible
              </span>
            ) : (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                Hidden
              </span>
            )}
          </div>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {link.url}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={onToggleVisibility}
          >
            {link.is_visible ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {link.is_visible ? 'Hide' : 'Show'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isFirst || isBusy}
            onClick={onMoveUp}
            aria-label="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isLast || isBusy}
            onClick={onMoveDown}
            aria-label="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={onDelete}
          >
            {isBusy ? <Spinner /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
