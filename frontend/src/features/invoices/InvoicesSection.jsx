import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight,
  FileSpreadsheet, Inbox, RefreshCw, Search, TrendingUp,
} from 'lucide-react'
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
  if (invoice.validation_state === 'passed')
    return <Badge tone="success" title={title}>Passed</Badge>
  if (invoice.validation_state === 'flagged')
    return <Badge tone="danger" title={title}>Needs review</Badge>
  return <Badge tone="neutral" title={title}>{invoice.math_validation_status ?? 'Unknown'}</Badge>
}

const STATS = [
  {
    key: 'total',
    label: 'Total Invoices',
    icon: FileSpreadsheet,
    gradient: 'bg-gradient-purple',
    trend: 'From Google Sheets',
  },
  {
    key: 'passed',
    label: 'Passed Validation',
    icon: CheckCircle2,
    gradient: 'bg-gradient-green',
    trend: 'Validated by AI',
  },
  {
    key: 'flagged',
    label: 'Needs Review',
    icon: AlertTriangle,
    gradient: 'bg-gradient-orange',
    trend: 'Requires attention',
  },
]

function StatCard({ label, value, loading, icon: Icon, gradient, trend }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dark-700 bg-dark-800 p-5 shadow-card">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full opacity-10 blur-2xl" style={{ background: 'radial-gradient(circle, white, transparent)' }} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-dark-300">{label}</p>
          {loading ? (
            <Skeleton className="mt-3 h-9 w-20" />
          ) : (
            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-100">{value ?? '—'}</p>
          )}
          {trend && !loading && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-dark-300">
              <TrendingUp className="size-3" />
              {trend}
            </p>
          )}
        </div>
        <span className={`flex size-11 items-center justify-center rounded-xl text-white shadow-lg ${gradient}`}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </div>
  )
}

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, i) => (
    <tr key={i} className="border-b border-dark-700">
      {Array.from({ length: 6 }, (_, j) => (
        <td key={j} className="px-5 py-4">
          <Skeleton className="h-4 w-full max-w-[8rem]" />
        </td>
      ))}
    </tr>
  ))
}

const TH = 'px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-dark-300'

export function InvoicesSection() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search.trim(), 300)
  const { data, isPending, isFetching, isError, error, refetch } = useInvoices({ page, pageSize: PAGE_SIZE, q })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const from  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to    = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="space-y-5">

      {/* ── Stats ─── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map(({ key, label, icon, gradient, trend }) => (
          <StatCard
            key={key}
            label={label}
            value={data?.summary[key]}
            loading={isPending}
            icon={icon}
            gradient={gradient}
            trend={trend}
          />
        ))}
      </div>

      {/* ── Table card ─── */}
      <Card>
        <CardHeader
          icon={FileSpreadsheet}
          title="Saved Invoices"
          description="Live from Google Sheets · newest first"
          gradient="bg-gradient-blue"
          action={
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-56 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-300" aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search invoices…"
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
          <div className="p-5">
            <ApiErrorAlert error={error} title="Couldn't load invoices" onRetry={() => refetch()} />
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching && !isPending ? 'opacity-50' : ''}`}>
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-900/50">
                  <th scope="col" className={TH}>Invoice #</th>
                  <th scope="col" className={TH}>Date</th>
                  <th scope="col" className={TH}>Supplier</th>
                  <th scope="col" className={TH}>Customer</th>
                  <th scope="col" className={`${TH} text-right`}>Total</th>
                  <th scope="col" className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isPending && <SkeletonRows />}

                {!isPending && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-dark-700 bg-dark-700">
                        <Inbox className="size-7 text-dark-300" aria-hidden />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-300">
                        {q ? 'No matching invoices' : 'No invoices yet'}
                      </p>
                      <p className="mt-1 text-xs text-dark-300">
                        {q ? 'Try a different keyword.' : 'Upload and confirm an invoice to see it here.'}
                      </p>
                    </td>
                  </tr>
                )}

                {items.map((inv, i) => (
                  <tr
                    key={`${inv.invoice_number}-${i}`}
                    className="border-b border-dark-700/50 transition-colors duration-100 hover:bg-brand-500/5"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-100">
                      {inv.invoice_number ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-dark-300">
                      {inv.invoice_date ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{inv.supplier_name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-300">{inv.customer_name ?? '—'}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-slate-100">
                      {formatMoney(inv.total_amount, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge invoice={inv} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dark-700 px-5 py-3.5">
            <p className="text-xs text-dark-300">
              <span className="font-semibold text-slate-300">{from}–{to}</span>
              {' '}of{' '}
              <span className="font-semibold text-slate-300">{total}</span> invoices
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="min-w-[3.5rem] text-center text-xs text-dark-300 tabular-nums">
                {page} / {data.total_pages}
              </span>
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
