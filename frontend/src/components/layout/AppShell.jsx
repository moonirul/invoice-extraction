import { ScanText } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useApiHealth } from '@/hooks/useInvoices'

function ApiStatus() {
  const { isPending, isError } = useApiHealth()
  if (isPending) return <Badge tone="neutral">Connecting…</Badge>
  return isError ? <Badge tone="danger">API offline</Badge> : <Badge tone="success">API online</Badge>
}

export function AppShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <ScanText className="size-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">Invoice Intelligence</p>
              <p className="hidden text-xs text-slate-500 sm:block">AI document extraction &amp; review</p>
            </div>
          </div>
          <ApiStatus />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        FastAPI · n8n · Google Sheets
      </footer>
    </div>
  )
}
