import clsx from 'clsx'
import { ListOrdered, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { inputClass } from '@/components/ui/Field'
import { formatMoney } from '@/lib/format'

const COLUMNS = [
  { key: 'item_code',   label: 'Item #',      width: 'w-24' },
  { key: 'description', label: 'Description',  width: 'min-w-[10rem]' },
  { key: 'quantity',    label: 'Qty',          width: 'w-16',  numeric: true },
  { key: 'unit_price',  label: 'Unit price',   width: 'w-24',  numeric: true },
  { key: 'discount',    label: 'Discount',     width: 'w-24',  numeric: true },
  { key: 'total',       label: 'Total',        width: 'w-28',  numeric: true },
]

const EMPTY_ROW = { item_code: '', description: '', quantity: '', unit_price: '', discount: '', total: '' }

export function LineItemsTable({ fields, register, remove, append, lineIssues, currency }) {
  return (
    <Card>
      <CardHeader
        icon={ListOrdered}
        title="Line Items"
        description={`${fields.length} item${fields.length === 1 ? '' : 's'} extracted`}
        gradient="bg-gradient-orange"
        action={
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => append({ ...EMPTY_ROW })}>
            Add row
          </Button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead>
            <tr className="border-b border-dark-700 bg-dark-900/50">
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={clsx(
                    'px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-dark-300',
                    c.numeric && 'text-right',
                  )}
                >
                  {c.label}
                </th>
              ))}
              <th scope="col" className="w-10 px-2">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-sm text-dark-300">
                  No line items detected — add one manually if needed.
                </td>
              </tr>
            )}
            {fields.map((row, index) => {
              const issue = lineIssues[index]
              return (
                <tr
                  key={row.id}
                  className={clsx(
                    'group border-b border-dark-700/50 transition-colors',
                    issue ? 'bg-amber-500/5' : 'hover:bg-brand-500/5',
                  )}
                >
                  {COLUMNS.map((c) => (
                    <td key={c.key} className={clsx('px-3 py-2 align-top', c.width)}>
                      <input
                        {...register(`line_items.${index}.${c.key}`)}
                        aria-label={`${c.label}, row ${index + 1}`}
                        inputMode={c.numeric ? 'decimal' : undefined}
                        className={clsx(
                          inputClass(c.key === 'total' && !!issue),
                          '!py-1.5 !shadow-none text-sm',
                          c.numeric && 'text-right tabular-nums',
                        )}
                      />
                      {c.key === 'total' && issue && (
                        <p className="mt-1 text-right text-[11px] text-amber-400 font-medium">
                          Expected {formatMoney(issue.expected, currency)}
                        </p>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove row ${index + 1}`}
                      className="rounded-lg p-2 text-dark-400 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
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
