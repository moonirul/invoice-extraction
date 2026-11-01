import clsx from 'clsx'
import { Bell, FileText, LayoutDashboard, Settings, Sparkles, Zap } from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText,        label: 'Invoices',  active: false },
  { icon: Sparkles,        label: 'Extractions', active: false },
  { icon: Settings,        label: 'Settings',  active: false, bottom: true },
]

function NavItem({ icon: Icon, label, active }) {
  return (
    <li>
      <button
        type="button"
        className={clsx(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          active
            ? 'nav-active'
            : 'text-slate-400 hover:bg-dark-700 hover:text-slate-200',
        )}
      >
        <Icon className="size-4.5 shrink-0" aria-hidden />
        <span>{label}</span>
      </button>
    </li>
  )
}

export function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-dark-900">

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-dark-700 bg-dark-800 lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-dark-700 px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-purple shadow-lg">
            <Zap className="size-4 text-white" fill="currentColor" aria-hidden />
          </span>
          <div className="leading-none">
            <span className="text-sm font-bold tracking-tight text-white">Invoice</span>
            <span className="text-sm font-bold text-brand-400">AI</span>
            <p className="text-[9px] font-medium uppercase tracking-widest text-dark-300 mt-0.5">
              Extraction Platform
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.filter((n) => !n.bottom).map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </ul>
          <ul className="mt-auto flex flex-col gap-0.5">
            {NAV_ITEMS.filter((n) => n.bottom).map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 border-t border-dark-700 p-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-purple text-xs font-bold text-white">
            AI
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">Admin</p>
            <p className="truncate text-[10px] text-dark-300">admin@invoiceai.com</p>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col">

        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-dark-700 bg-dark-800/80 px-6 backdrop-blur-xl">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-md bg-gradient-purple">
              <Zap className="size-3.5 text-white" fill="currentColor" aria-hidden />
            </span>
            <span className="text-sm font-bold text-white">Invoice<span className="text-brand-400">AI</span></span>
          </div>

          {/* Page title (desktop) */}
          <h1 className="hidden text-sm font-semibold text-slate-200 lg:block">Dashboard</h1>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              System Online
            </div>

            {/* Bell */}
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg border border-dark-600 bg-dark-700 text-slate-400 transition hover:bg-dark-600 hover:text-slate-200"
            >
              <Bell className="size-4" aria-hidden />
            </button>

            {/* Avatar */}
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-purple text-xs font-bold text-white shadow-sm">
              AI
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-dark-700 px-6 py-3 text-center text-[11px] text-dark-300">
          © {new Date().getFullYear()} <span className="text-brand-400 font-medium">InvoiceAI</span> · All rights reserved
        </footer>
      </div>
    </div>
  )
}
