import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export function ApiErrorAlert({ error, title = 'Something went wrong', onRetry }) {
  if (!error) return null
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-800">{title}</p>
        <p className="mt-0.5 text-sm text-red-700">{error.message}</p>
        {error.requestId && (
          <p className="mt-1 text-xs text-red-600/80">Reference: <code>{error.requestId}</code></p>
        )}
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>Retry</Button>
      )}
    </div>
  )
}
