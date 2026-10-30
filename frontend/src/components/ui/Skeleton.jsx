import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-md bg-slate-200/70', className)} aria-hidden />
}
