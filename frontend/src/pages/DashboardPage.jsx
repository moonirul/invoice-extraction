import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert'
import { InvoicesSection } from '@/features/invoices/InvoicesSection'
import { ReviewForm } from '@/features/review/ReviewForm'
import { ReviewSkeleton } from '@/features/review/ReviewSkeleton'
import { UploadCard } from '@/features/upload/UploadCard'
import { useExtractInvoice, useSaveInvoice } from '@/hooks/useInvoices'

export default function DashboardPage() {
  const [file, setFile] = useState(null)
  const [session, setSession] = useState(0)
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
        toast.success('Invoice saved to Google Sheets 🎉')
        reset()
      },
      onError: (error) =>
        toast.error(error.message, {
          description: error.requestId ? `Reference: ${error.requestId}` : undefined,
        }),
    })
  }

  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dark-700 pb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-gradient-purple">
              <Sparkles className="size-3.5 text-white" aria-hidden />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-400">
              AI-Powered
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Invoice Extraction
          </h1>
          <p className="mt-1 text-sm text-dark-300">
            Upload a PDF invoice · AI extracts, validates, and saves to your Google Sheet.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-xs text-dark-300">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          Google Sheets connected
        </div>
      </div>

      {/* ── Upload ──────────────────────────────────────────────────── */}
      <ErrorBoundary title="The upload section failed to load" onReset={reset}>
        <UploadCard
          file={file}
          onFileChange={setFile}
          onExtract={handleExtract}
          extracting={extract.isPending}
        />
      </ErrorBoundary>

      {/* ── Extraction error ────────────────────────────────────────── */}
      {extract.isError && (
        <ApiErrorAlert error={extract.error} title="Extraction failed" onRetry={handleExtract} />
      )}

      {/* ── Loading skeleton ────────────────────────────────────────── */}
      {extract.isPending && <ReviewSkeleton />}

      {/* ── Review form ─────────────────────────────────────────────── */}
      {extract.isSuccess && (
        <ErrorBoundary title="The review form failed to render" onReset={reset}>
          <ReviewForm
            key={session}
            result={extract.data}
            onSave={handleSave}
            onDiscard={reset}
            saving={save.isPending}
          />
        </ErrorBoundary>
      )}

      {/* ── Invoice table ───────────────────────────────────────────── */}
      <ErrorBoundary title="The invoice table failed to load">
        <InvoicesSection />
      </ErrorBoundary>
    </>
  )
}
