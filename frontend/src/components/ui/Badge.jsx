import clsx from 'clsx'

const tones = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}
const dots = {
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-brand-500',
  neutral: 'bg-slate-400',
}

export function Badge({ tone = 'neutral', dot = true, className, children, ...props }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={clsx('size-1.5 rounded-full', dots[tone])} aria-hidden />}
      {children}
    </span>
  )
}
