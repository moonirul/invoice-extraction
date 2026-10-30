import clsx from 'clsx'
import { FileText, Sparkles, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { env } from '@/config/env'
import { formatBytes } from '@/lib/format'

function validate(file) {
  if (!file) return null
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) return 'Only PDF files are supported.'
  if (file.size > env.maxUploadMb * 1024 * 1024) return `File is larger than ${env.maxUploadMb} MB.`
  if (file.size === 0) return 'This file is empty.'
  return null
}

export function UploadCard({ file, onFileChange, onExtract, extracting }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState(null)

  const choose = (candidate) => {
    const problem = validate(candidate)
    setFileError(problem)
    onFileChange(problem ? null : (candidate ?? null))
    if (inputRef.current) inputRef.current.value = ''
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (!extracting) choose(event.dataTransfer.files?.[0])
  }

  return (
    <Card>
      <CardHeader
        icon={UploadCloud}
        title="Upload invoice"
        description="Drop a PDF invoice and our AI will extract the details for your review."
      />
      <CardBody className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={clsx(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
            dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50/60 hover:border-slate-400',
            extracting && 'pointer-events-none opacity-60',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-slate-200">
            <UploadCloud className="size-6" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-900">
            Drag &amp; drop your PDF here, or{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded text-brand-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              browse files
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-500">PDF only · up to {env.maxUploadMb} MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF invoice"
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </div>

        {fileError && <p role="alert" className="text-sm text-red-600">{fileError}</p>}

        {file && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <FileText className="size-5 shrink-0 text-brand-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => choose(null)}
              disabled={extracting}
              aria-label="Remove file"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <Button icon={Sparkles} loading={extracting} disabled={!file} onClick={onExtract}>
            {extracting ? 'Extracting with AI…' : 'Extract invoice'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
