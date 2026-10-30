import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert'
import { InvoicesSection } from '@/features/invoices/InvoicesSection'
import { ReviewForm } from '@/features/review/ReviewForm'
import { ReviewSkeleton } from '@/features/review/ReviewSkeleton'
import { UploadCard } from '@/features/upload/UploadCard'
import { useExtractInvoice, useSaveInvoice } from '@/hooks/useInvoices'

export default function DashboardPage() {
  const [file, setFile] = useState(null)
  const [session, setSession] = useState(0) // remounts the form for each new extraction
  const extract = useExtractInvoice()
  const save = useSaveInvoice()

  const reset = () => {
    extract.reset()
    save.reset()
    setFile(null)
  }

  const handleExtract = () => {
    if (!file) return
    save.reset()
    extract.mutate(file, { onSuccess: () => setSession((n) => n + 1) })
  }

  const handleSave = (payload) => {
    save.mutate(payload, {
      onSuccess: () => {
        toast.success('Invoice saved to Google Sheets')
        reset()
      },
      onError: (error) => toast.error(error.message, { description: error.requestId ? `Reference: ${error.requestId}` : undefined }),
    })
  }

  return (
    <>
      <ErrorBoundary title="The upload section failed to load" onReset={reset}>
        <UploadCard file={file} onFileChange={setFile} onExtract={handleExtract} extracting={extract.isPending} />
      </ErrorBoundary>

      {extract.isError && (
        <ApiErrorAlert error={extract.error} title="Extraction failed" onRetry={handleExtract} />
      )}

      {extract.isPending && <ReviewSkeleton />}

      {extract.isSuccess && (
        <ErrorBoundary title="The review form failed to render" onReset={reset}>
          <ReviewForm key={session} result={extract.data} onSave={handleSave} onDiscard={reset} saving={save.isPending} />
        </ErrorBoundary>
      )}

      <ErrorBoundary title="The invoice table failed to load">
        <InvoicesSection />
      </ErrorBoundary>
    </>
  )
}
