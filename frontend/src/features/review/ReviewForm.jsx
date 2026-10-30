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
        <input {...props} {...register(name, required ? { required: `${label} is required` } : undefined)} {...rest} />
      )}
    </Field>
  )
}

function PartyFields({ prefix, register }) {
  return (
    <div className="space-y-4">
      <TextField label="Name" name={`${prefix}.name`} register={register} />
      <TextField label="Address" name={`${prefix}.address`} register={register} />
      <TextField label="Tax ID" name={`${prefix}.tax_id`} register={register} />
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

  const payload = useMemo(() => toPayload(values, original), [values, original])
  const analysis = useMemo(() => computeChecks(payload), [payload])
  const server = useMemo(() => getServerValidation(original), [original])
  const currency = payload.invoice_details?.currency

  const submit = handleSubmit((formValues) => onSave(toPayload(formValues, original)))
  const e = errors

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader
            icon={FileText}
            title="Invoice details"
            description={`Extracted from ${result.filename} · ${result.page_count} page${result.page_count === 1 ? '' : 's'}`}
            action={<Badge tone="info">Review &amp; edit</Badge>}
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <TextField label="Invoice number" name="invoice_details.invoice_number" register={register} required error={e.invoice_details?.invoice_number?.message} />
            <TextField label="PO number" name="invoice_details.po_number" register={register} />
            <TextField label="Invoice date" name="invoice_details.invoice_date" register={register} />
            <TextField label="Due date" name="invoice_details.due_date" register={register} />
            <TextField label="Currency" name="invoice_details.currency" register={register} placeholder="USD" maxLength={3} />
          </CardBody>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader icon={Building2} title="Supplier" />
            <CardBody><PartyFields prefix="supplier" register={register} /></CardBody>
          </Card>
          <Card>
            <CardHeader icon={UserRound} title="Customer" />
            <CardBody><PartyFields prefix="customer" register={register} /></CardBody>
          </Card>
        </div>

        <LineItemsTable
          fields={fields}
          register={register}
          remove={remove}
          append={append}
          lineIssues={analysis.lineIssues}
          currency={currency}
        />
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardHeader icon={Receipt} title="Financial summary" />
          <CardBody className="space-y-4">
            <TextField label="Subtotal" name="financial_summary.subtotal" register={register} inputMode="decimal" />
            <TextField label="Discount" name="financial_summary.discount_amount" register={register} inputMode="decimal" />
            <TextField label="Tax" name="financial_summary.tax_amount" register={register} inputMode="decimal" />
            <TextField label="Shipping" name="financial_summary.shipping_amount" register={register} inputMode="decimal" />
            <TextField label="Total amount" name="financial_summary.total_amount" register={register} inputMode="decimal" className="border-t border-slate-100 pt-4" />
          </CardBody>
        </Card>

        <ValidationPanel analysis={analysis} server={server} />

        <div className="space-y-2">
          <Button type="submit" size="lg" icon={CheckCheck} loading={saving} className="w-full">
            {saving ? 'Saving to Google Sheets…' : analysis.hasIssues ? 'Save with warnings' : 'Confirm & Save to Google Sheets'}
          </Button>
          <Button variant="ghost" icon={Trash2} onClick={onDiscard} disabled={saving} className="w-full">
            Discard
          </Button>
        </div>
      </aside>
    </form>
  )
}
