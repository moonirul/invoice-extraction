import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function ApiErrorAlert({ error, title = 'Something went wrong', onRetry }) {
  if (!error) return null
  return (
    <div role="alert" className="flex gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
        <AlertCircle className="size-5 text-red-400" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-300">{title}</p>
        <p className="mt-0.5 text-sm text-red-400/80">{error.message}</p>
        {error.requestId && (
          <p className="mt-1 text-xs text-red-500/60">
            Ref: <code className="font-mono">{error.requestId}</code>
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
