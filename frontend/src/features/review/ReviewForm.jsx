import { Building2, CheckCheck, FileText, Receipt, Trash2, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { computeChecks, getServerValidation, toFormValues, toPayload } from '@/lib/invoice'
import { LineItemsTable } from './LineItemsTable'
import { ValidationPanel } from './ValidationPanel'

function TextField({ label, name, register, error, required, className, ...rest }) {
  return (
    <Field label={label} error={error} required={required} className={className}>
      {(props) => (
        <input
          {...props}
          {...register(name, required ? { required: `${label} is required` } : undefined)}
          {...rest}
        />
      )}
    </Field>
  )
}

function PartyFields({ prefix, register }) {
  return (
    <div className="space-y-4">
      <TextField label="Name"    name={`${prefix}.name`}    register={register} />
      <TextField label="Address" name={`${prefix}.address`} register={register} />
      <TextField label="Tax ID"  name={`${prefix}.tax_id`}  register={register} />
    </div>
  )
}

export function ReviewForm({ result, onSave, onDiscard, saving }) {
  const original = result.data
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: toFormValues(original),
    mode: 'onTouched',
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' })
  const values = useWatch({ control })

  const payload  = useMemo(() => toPayload(values, original), [values, original])
  const analysis = useMemo(() => computeChecks(payload), [payload])
  const server   = useMemo(() => getServerValidation(original), [original])
  const currency = payload.invoice_details?.currency

  const submit = handleSubmit((formValues) => onSave(toPayload(formValues, original)))
  const e = errors

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">

      {/* ── Left: main fields ────────────────────────────────────────── */}
      <div className="space-y-6 lg:col-span-2">

        {/* Invoice details */}
        <Card>
          <CardHeader
            icon={FileText}
            title="Invoice Details"
            description={`${result.filename} · ${result.page_count} page${result.page_count === 1 ? '' : 's'}`}
            gradient="bg-gradient-purple"
            action={<Badge tone="info" dot={false}>Review & edit</Badge>}
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Invoice number" name="invoice_details.invoice_number"
              register={register} required
              error={e.invoice_details?.invoice_number?.message}
            />
            <TextField label="PO number"    name="invoice_details.po_number"    register={register} />
            <TextField label="Invoice date" name="invoice_details.invoice_date" register={register} />
            <TextField label="Due date"     name="invoice_details.due_date"     register={register} />
            <TextField label="Currency"     name="invoice_details.currency"     register={register} placeholder="USD" maxLength={3} />
          </CardBody>
        </Card>

        {/* Supplier / Customer */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader icon={Building2} title="Supplier" gradient="bg-gradient-blue" />
            <CardBody><PartyFields prefix="supplier" register={register} /></CardBody>
          </Card>
          <Card>
            <CardHeader icon={UserRound} title="Customer" gradient="bg-gradient-pink" />
            <CardBody><PartyFields prefix="customer" register={register} /></CardBody>
          </Card>
        </div>

        {/* Line items */}
        <LineItemsTable
          fields={fields}
          register={register}
          remove={remove}
          append={append}
          lineIssues={analysis.lineIssues}
          currency={currency}
        />
      </div>

      {/* ── Right: sticky sidebar ─────────────────────────────────────── */}
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">

        {/* Financial summary */}
        <Card>
          <CardHeader icon={Receipt} title="Financial Summary" gradient="bg-gradient-green" />
          <CardBody className="space-y-4">
            <TextField label="Subtotal"     name="financial_summary.subtotal"        register={register} inputMode="decimal" />
            <TextField label="Discount"     name="financial_summary.discount_amount" register={register} inputMode="decimal" />
            <TextField label="Tax"          name="financial_summary.tax_amount"      register={register} inputMode="decimal" />
            <TextField label="Shipping"     name="financial_summary.shipping_amount" register={register} inputMode="decimal" />
            <div className="border-t border-dark-700 pt-4">
              <TextField label="Total amount" name="financial_summary.total_amount"  register={register} inputMode="decimal" />
            </div>
          </CardBody>
        </Card>

        {/* Validation */}
        <ValidationPanel analysis={analysis} server={server} />

        {/* Action panel */}
        <div className="space-y-2.5 rounded-xl border border-dark-700 bg-dark-800 p-4 shadow-card">
          <Button type="submit" size="lg" icon={CheckCheck} loading={saving} className="w-full">
            {saving
              ? 'Saving…'
              : analysis.hasIssues
                ? 'Save with warnings'
                : 'Confirm & Save to Sheets'}
          </Button>
          <Button
            variant="ghost"
            icon={Trash2}
            onClick={onDiscard}
            disabled={saving}
            className="w-full text-dark-300 hover:bg-red-500/10 hover:text-red-400"
          >
            Discard extraction
          </Button>
        </div>
      </aside>
    </form>
  )
}
