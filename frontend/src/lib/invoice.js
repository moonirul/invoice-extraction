/**
 * Pure helpers for the review form: API <-> form mapping and client-side math checks.
 * Kept free of React so they can be unit-tested.
 */

const TOLERANCE = 0.02 // cents-level rounding differences are fine

export const FIELDS = {
  invoice_details: ['invoice_number', 'invoice_date', 'due_date', 'po_number', 'currency'],
  supplier: ['name', 'address', 'tax_id'],
  customer: ['name', 'address', 'tax_id'],
  financial_summary: ['subtotal', 'discount_amount', 'tax_amount', 'shipping_amount', 'total_amount'],
  line_item: ['item_code', 'description', 'quantity', 'unit_price', 'discount', 'total'],
}
const NUMERIC = {
  financial_summary: new Set(['subtotal', 'discount_amount', 'tax_amount', 'shipping_amount', 'total_amount']),
  line_item: new Set(['quantity', 'unit_price', 'discount', 'total']),
}

export function parseAmount(input) {
  if (input === null || input === undefined) return null
  if (typeof input === 'number') return Number.isFinite(input) ? input : null
  const raw = String(input).trim()
  if (!raw) return null
  const negative = raw.startsWith('(') && raw.endsWith(')')
  let cleaned = raw.replace(/[^0-9.,-]/g, '')
  if (cleaned.includes(',') && cleaned.includes('.')) cleaned = cleaned.replace(/,/g, '')
  else if (cleaned.includes(',')) cleaned = /,\d{1,2}$/.test(cleaned) ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '')
  const n = Number(cleaned)
  if (!cleaned || Number.isNaN(n)) return null
  return negative ? -Math.abs(n) : n
}

const str = (v) => (v === null || v === undefined ? '' : String(v))
const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, str(obj?.[k])]))

/** API payload -> flat string values for the inputs. */
export function toFormValues(data) {
  return {
    invoice_details: pick(data?.invoice_details, FIELDS.invoice_details),
    supplier: pick(data?.supplier, FIELDS.supplier),
    customer: pick(data?.customer, FIELDS.customer),
    financial_summary: pick(data?.financial_summary, FIELDS.financial_summary),
    line_items: (data?.line_items ?? []).map((item) => pick(item, FIELDS.line_item)),
  }
}

function mergeSection(original, values, keys, numeric) {
  const out = { ...(original ?? {}) } // preserves fields the workflow added that we don't render
  for (const key of keys) {
    const v = values?.[key] ?? ''
    out[key] = numeric?.has(key) ? parseAmount(v) : v.trim() === '' ? null : v.trim()
  }
  return out
}

/** Form values (+ the original extraction) -> API payload. */
export function toPayload(values, original) {
  const v = values ?? {}
  return {
    ...(original ?? {}),
    invoice_details: mergeSection(original?.invoice_details, v.invoice_details, FIELDS.invoice_details),
    supplier: mergeSection(original?.supplier, v.supplier, FIELDS.supplier),
    customer: mergeSection(original?.customer, v.customer, FIELDS.customer),
    financial_summary: mergeSection(original?.financial_summary, v.financial_summary, FIELDS.financial_summary, NUMERIC.financial_summary),
    line_items: (v.line_items ?? []).map((row, i) =>
      mergeSection(original?.line_items?.[i], row, FIELDS.line_item, NUMERIC.line_item),
    ),
  }
}

const close = (a, b) => Math.abs(a - b) <= TOLERANCE
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/**
 * Recompute the invoice maths from the (possibly edited) payload.
 * Returns checks for the sidebar and per-row issues for the table.
 */
export function computeChecks(payload) {
  const items = payload?.line_items ?? []
  const fin = payload?.financial_summary ?? {}
  const checks = []
  const lineIssues = {}

  // 1. quantity × unit price − discount = line total
  let comparable = 0
  items.forEach((item, index) => {
    const qty = num(item.quantity), unit = num(item.unit_price), total = num(item.total)
    if (qty === null || unit === null || total === null) return
    comparable += 1
    const expected = qty * unit - (num(item.discount) ?? 0)
    if (!close(expected, total)) lineIssues[index] = { expected, actual: total }
  })
  const badRows = Object.keys(lineIssues).length
  checks.push({
    id: 'line_totals',
    label: 'Line totals',
    status: comparable === 0 ? 'skip' : badRows ? 'fail' : 'pass',
    message: comparable === 0 ? 'Not enough data to verify' : badRows ? `${badRows} line${badRows > 1 ? 's' : ''} don't add up` : 'Qty × price − discount matches',
  })

  // 2. sum(line totals) = subtotal
  const lineTotals = items.map((i) => num(i.total)).filter((n) => n !== null)
  const subtotal = num(fin.subtotal)
  if (subtotal === null || lineTotals.length === 0) {
    checks.push({ id: 'subtotal', label: 'Subtotal', status: 'skip', message: 'Not enough data to verify' })
  } else {
    const sum = lineTotals.reduce((a, b) => a + b, 0)
    checks.push({
      id: 'subtotal',
      label: 'Subtotal',
      status: close(sum, subtotal) ? 'pass' : 'fail',
      message: close(sum, subtotal) ? 'Matches the sum of line items' : `Line items sum to ${sum.toFixed(2)}`,
    })
  }

  // 3. subtotal − discount + tax + shipping = total
  const total = num(fin.total_amount)
  if (subtotal === null || total === null) {
    checks.push({ id: 'grand_total', label: 'Grand total', status: 'skip', message: 'Not enough data to verify' })
  } else {
    const expected = subtotal - Math.abs(num(fin.discount_amount) ?? 0) + (num(fin.tax_amount) ?? 0) + (num(fin.shipping_amount) ?? 0)
    checks.push({
      id: 'grand_total',
      label: 'Grand total',
      status: close(expected, total) ? 'pass' : 'fail',
      message: close(expected, total) ? 'Subtotal, discount, tax and shipping reconcile' : `Expected ${expected.toFixed(2)} from the summary fields`,
    })
  }

  return { checks, lineIssues, hasIssues: checks.some((c) => c.status === 'fail') }
}

/** Best-effort read of the validation block produced by the n8n workflow. */
export function getServerValidation(data) {
  const raw = data?.math_validation ?? data?.validation ?? data?.validation_flags
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'string') return { status: raw, messages: [] }
  if (typeof raw !== 'object') return null
  const status = [raw.status, raw.overall_status, raw.result, raw.summary].find((v) => typeof v === 'string') ?? null
  const messages = ['errors', 'warnings', 'issues', 'flags', 'messages'].flatMap((k) =>
    Array.isArray(raw[k]) ? raw[k].filter((x) => typeof x === 'string') : [],
  )
  return status || messages.length ? { status, messages } : null
}
