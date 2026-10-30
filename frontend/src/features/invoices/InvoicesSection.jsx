import { ChevronLeft, ChevronRight, FileSpreadsheet, Inbox, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ApiErrorAlert } from '@/components/ui/ApiErrorAlert'
import { inputClass } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useInvoices } from '@/hooks/useInvoices'
import { formatMoney } from '@/lib/format'

const PAGE_SIZE = 10

function StatusBadge({ invoice }) {
  const title = invoice.math_validation_status ?? undefined
  if (invoice.validation_state === 'passed') return <Badge tone="success" title={title}>Passed</Badge>
  if (invoice.validation_state === 'flagged') return <Badge tone="danger" title={title}>Needs review</Badge>
  return <Badge tone="neutral" title={title}>{invoice.math_validation_status ?? 'Unknown'}</Badge>
}

function Stat({ label, value, loading, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {loading ? <Skeleton className="mt-2 h-7 w-16" /> : <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? 'text-slate-900'}`}>{value}</p>}
    </div>
  )
}

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, i) => (
    <tr key={i}>
      {Array.from({ length: 6 }, (_, j) => (
        <td key={j} className="px-4 py-3.5"><Skeleton className="h-4 w-full max-w-[10rem]" /></td>
      ))}
    </tr>
  ))
}

export function InvoicesSection() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search.trim(), 300)
  const { data, isPending, isFetching, isError, error, refetch } = useInvoices({ page, pageSize: PAGE_SIZE, q })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Saved invoices" value={data?.summary.total} loading={isPending} />
        <Stat label="Passed validation" value={data?.summary.passed} loading={isPending} tone="text-emerald-600" />
        <Stat label="Needs review" value={data?.summary.flagged} loading={isPending} tone="text-red-600" />
      </div>

      <Card>
        <CardHeader
          icon={FileSpreadsheet}
          title="Saved invoices"
          description="Live from your Google Sheet, newest first."
          action={
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search number, supplier…"
                  aria-label="Search saved invoices"
                  className={`${inputClass(false)} !py-1.5 pl-9`}
                />
              </div>
              <Button variant="secondary" size="sm" icon={RefreshCw} loading={isFetching && !isPending} onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          }
        />

        {isError && !data ? (
          <div className="p-5"><ApiErrorAlert error={error} title="Couldn't load saved invoices" onRetry={() => refetch()} /></div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${isFetching && !isPending ? 'opacity-70' : ''}`}>
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2.5">Invoice</th>
                  <th scope="col" className="px-4 py-2.5">Date</th>
                  <th scope="col" className="px-4 py-2.5">Supplier</th>
                  <th scope="col" className="px-4 py-2.5">Customer</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Total</th>
                  <th scope="col" className="px-4 py-2.5">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isPending && <SkeletonRows />}
                {!isPending && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <Inbox className="mx-auto size-8 text-slate-300" aria-hidden />
                      <p className="mt-2 text-sm font-medium text-slate-700">{q ? 'No invoices match your search' : 'No saved invoices yet'}</p>
                      <p className="text-sm text-slate-500">{q ? 'Try a different keyword.' : 'Upload and confirm an invoice to see it here.'}</p>
                    </td>
                  </tr>
                )}
                {items.map((inv, i) => (
                  <tr key={`${inv.invoice_number}-${i}`} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{inv.invoice_number ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{inv.invoice_date ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{inv.supplier_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{inv.customer_name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">{formatMoney(inv.total_amount, inv.currency)}</td>
                    <td className="px-4 py-3"><StatusBadge invoice={inv} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{from}–{to}</span> of <span className="font-medium text-slate-700">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="px-1 text-sm tabular-nums text-slate-500">{page} / {data.total_pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
