import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:outline-brand-600',
  secondary:
    'bg-white text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-brand-600',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:outline-brand-600',
  danger:
    'bg-white text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50 focus-visible:outline-red-600',
}
const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
    </button>
  )
}
