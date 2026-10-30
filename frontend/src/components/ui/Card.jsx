import clsx from 'clsx'

export function Card({ className, children, ...props }) {
  return (
    <section className={clsx('rounded-xl border border-slate-200 bg-white shadow-card', className)} {...props}>
      {children}
    </section>
  )
}

export function CardHeader({ title, description, action, icon: Icon }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={clsx('p-5', className)}>{children}</div>
}
