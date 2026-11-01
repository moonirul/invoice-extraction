import clsx from 'clsx'

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-dark-700',
        className,
      )}
      aria-hidden
    />
  )
}
