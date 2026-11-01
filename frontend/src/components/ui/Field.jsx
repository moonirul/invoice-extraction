import clsx from 'clsx'
import { useId } from 'react'

export const inputClass = (invalid) =>
  clsx(
    'block w-full rounded-lg border bg-dark-700 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm transition-all duration-150',
    'placeholder:text-dark-300',
    'focus:outline-none focus:ring-2',
    invalid
      ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/15'
      : 'border-dark-600 hover:border-dark-500 focus:border-brand-500/60 focus:ring-brand-500/15',
  )

export function Field({ label, error, hint, required, className, children }) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dark-300">
        {label}
        {required && <span className="ml-0.5 text-red-400" aria-hidden>*</span>}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: inputClass(!!error),
      })}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-red-400">
          ⚠ {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-dark-300">{hint}</p>
      ) : null}
    </div>
  )
}
