import clsx from 'clsx'
import { FileText, Sparkles, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
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
    <div className="relative overflow-hidden rounded-xl border border-dark-700 bg-dark-800">
      {/* Gradient top accent */}
      <div className="h-px w-full bg-gradient-brand opacity-60" />

      {/* Glow blob decoration */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-purple shadow-lg">
              <UploadCloud className="size-5 text-white" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Upload Invoice</h2>
              <p className="text-xs text-dark-300">AI-powered extraction · PDF only</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-400">
            <Sparkles className="size-3" />
            AI Ready
          </span>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !extracting && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !extracting && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Click or drag to upload a PDF invoice"
          className={clsx(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-14 text-center transition-all duration-200 cursor-pointer',
            dragging
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-dark-600 hover:border-brand-500/50 hover:bg-brand-500/5',
            extracting && 'pointer-events-none opacity-50',
          )}
        >
          {/* Icon */}
          <div className={clsx(
            'mb-5 flex size-20 items-center justify-center rounded-2xl transition-all duration-200',
            dragging
              ? 'bg-gradient-brand shadow-lg shadow-brand-500/30'
              : 'border border-dark-600 bg-dark-700',
          )}>
            <UploadCloud className={clsx('size-9 transition-colors', dragging ? 'text-white' : 'text-brand-400')} aria-hidden />
          </div>

          <p className="text-base font-semibold text-slate-200">
            {dragging ? 'Drop your PDF here' : 'Drag & drop your invoice'}
          </p>
          <p className="mt-1.5 text-sm text-dark-300">
            or{' '}
            <span className="font-semibold text-brand-400 underline underline-offset-2 hover:text-brand-300 transition-colors">
              click to browse
            </span>
            {' '}· up to {env.maxUploadMb} MB
          </p>

          {/* Gradient corner decorations when dragging */}
          {dragging && (
            <>
              <div className="pointer-events-none absolute left-2 top-2 size-6 rounded-tl-lg border-l-2 border-t-2 border-brand-400" />
              <div className="pointer-events-none absolute right-2 top-2 size-6 rounded-tr-lg border-r-2 border-t-2 border-brand-400" />
              <div className="pointer-events-none absolute bottom-2 left-2 size-6 rounded-bl-lg border-b-2 border-l-2 border-brand-400" />
              <div className="pointer-events-none absolute bottom-2 right-2 size-6 rounded-br-lg border-b-2 border-r-2 border-brand-400" />
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Choose a PDF invoice"
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </div>

        {/* File error */}
        {fileError && (
          <p role="alert" className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold">!</span>
            {fileError}
          </p>
        )}

        {/* Selected file chip */}
        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dark-600 bg-dark-700 px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20">
              <FileText className="size-5 text-brand-400" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{file.name}</p>
              <p className="text-xs text-dark-300">{formatBytes(file.size)} · Ready for extraction</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); choose(null) }}
              disabled={extracting}
              aria-label="Remove file"
              className="rounded-lg p-1.5 text-dark-300 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* CTA row */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-dark-300">
            {extracting
              ? '⚡ AI is reading your invoice…'
              : 'Supports multi-page, scanned PDFs'}
          </p>
          <Button icon={Sparkles} loading={extracting} disabled={!file} onClick={onExtract} size="lg">
            {extracting ? 'Extracting…' : 'Extract with AI'}
          </Button>
        </div>
      </div>
    </div>
  )
}
