import clsx from 'clsx'

const tones = {
  success: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  danger:  'bg-red-500/15    text-red-400    ring-red-500/30',
  warning: 'bg-amber-500/15  text-amber-400  ring-amber-500/30',
  info:    'bg-brand-500/15  text-brand-400  ring-brand-500/30',
  neutral: 'bg-dark-600      text-slate-400  ring-dark-500',
}

const dots = {
  success: 'bg-emerald-400',
  danger:  'bg-red-400',
  warning: 'bg-amber-400',
  info:    'bg-brand-400',
  neutral: 'bg-dark-300',
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
      {dot && <span className={clsx('size-1.5 rounded-full shrink-0', dots[tone])} aria-hidden />}
      {children}
    </span>
  )
}
