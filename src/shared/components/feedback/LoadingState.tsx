import { Spinner } from '@/shared/components/ui'

export interface LoadingStateProps {
  message?: string
}

/** Inline loading indicator for content regions within a laid-out page. */
export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
      <Spinner />
      <span>{message}</span>
    </div>
  )
}
