import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: [
    'bg-gradient-brand text-white shadow-sm',
    'hover:opacity-90 hover:shadow-lg',
    'focus-visible:outline-brand-500',
  ],
  secondary: [
    'border border-dark-600 bg-dark-700 text-slate-300',
    'hover:bg-dark-600 hover:text-slate-100 hover:border-dark-500',
    'focus-visible:outline-brand-500',
  ],
  ghost: [
    'text-slate-400',
    'hover:bg-dark-700 hover:text-slate-200',
    'focus-visible:outline-brand-500',
  ],
  danger: [
    'border border-red-900/50 bg-red-900/20 text-red-400',
    'hover:bg-red-900/40 hover:text-red-300',
    'focus-visible:outline-red-500',
  ],
}

const sizes = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-4 text-sm',
  lg: 'h-10 gap-2 px-5 text-sm font-semibold',
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
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading
        ? <Loader2 className="size-4 animate-spin shrink-0" aria-hidden />
        : Icon
          ? <Icon className="size-4 shrink-0" aria-hidden />
          : null}
      {children}
    </button>
  )
}
