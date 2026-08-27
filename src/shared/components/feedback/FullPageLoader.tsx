import { Spinner } from '@/shared/components/ui'

export interface FullPageLoaderProps {
  message?: string
}

/** Centered loader for blocking states (e.g. resolving the initial session). */
export function FullPageLoader({ message }: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
      <Spinner className="h-6 w-6" />
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  )
}
