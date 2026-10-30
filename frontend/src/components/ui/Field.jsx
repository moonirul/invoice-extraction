import clsx from 'clsx'
import { useId } from 'react'

export const inputClass = (invalid) =>
  clsx(
    'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition',
    'placeholder:text-slate-400 focus:outline-none focus:ring-2',
    invalid
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-500/20',
  )

/** Label + control + error. `children` receives the generated id and aria props. */
export function Field({ label, error, hint, required, className, children }) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, className: inputClass(!!error) })}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}
