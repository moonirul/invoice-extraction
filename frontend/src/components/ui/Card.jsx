import clsx from 'clsx'

export function Card({ className, children, ...props }) {
  return (
    <section
      className={clsx(
        'rounded-xl border border-dark-700 bg-dark-800 shadow-card',
        'transition-all duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export function CardHeader({ title, description, action, icon: Icon, gradient = 'bg-gradient-purple' }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dark-700 px-5 py-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={clsx('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm', gradient)}>
            <Icon className="size-4" aria-hidden />
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-dark-300">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={clsx('p-5', className)}>{children}</div>
}
