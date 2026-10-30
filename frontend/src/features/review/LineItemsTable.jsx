import clsx from 'clsx'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { inputClass } from '@/components/ui/Field'
import { formatMoney } from '@/lib/format'
import { ListOrdered } from 'lucide-react'

const COLUMNS = [
  { key: 'item_code', label: 'Item #', width: 'w-24' },
  { key: 'description', label: 'Description', width: 'min-w-[10rem]' },
  { key: 'quantity', label: 'Qty', width: 'w-16', numeric: true },
  { key: 'unit_price', label: 'Unit price', width: 'w-24', numeric: true },
  { key: 'discount', label: 'Discount', width: 'w-24', numeric: true },
  { key: 'total', label: 'Total', width: 'w-28', numeric: true },
]

const EMPTY_ROW = { item_code: '', description: '', quantity: '', unit_price: '', discount: '', total: '' }

export function LineItemsTable({ fields, register, remove, append, lineIssues, currency }) {
  return (
    <Card>
      <CardHeader
        icon={ListOrdered}
        title="Line items"
        description={`${fields.length} item${fields.length === 1 ? '' : 's'} extracted`}
        action={
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => append({ ...EMPTY_ROW })}>
            Add item
          </Button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium uppercase tracking-wide text-slate-500">
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" className={clsx('px-3 py-2.5', c.numeric && 'text-right')}>{c.label}</th>
              ))}
              <th scope="col" className="w-10 px-2"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-8 text-center text-sm text-slate-500">
                  No line items were detected. Add one manually if needed.
                </td>
              </tr>
            )}
            {fields.map((row, index) => {
              const issue = lineIssues[index]
              return (
                <tr key={row.id} className={clsx(issue && 'bg-amber-50/60')}>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className={clsx('px-2 py-1.5 align-top', c.width)}>
                      <input
                        {...register(`line_items.${index}.${c.key}`)}
                        aria-label={`${c.label}, row ${index + 1}`}
                        inputMode={c.numeric ? 'decimal' : undefined}
                        className={clsx(
                          inputClass(c.key === 'total' && !!issue),
                          '!py-1.5 !shadow-none',
                          c.numeric && 'text-right tabular-nums',
                        )}
                      />
                      {c.key === 'total' && issue && (
                        <p className="mt-1 text-right text-xs text-amber-700">
                          Expected {formatMoney(issue.expected, currency)}
                        </p>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 align-top">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove row ${index + 1}`}
                      className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
