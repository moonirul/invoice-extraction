import { describe, expect, it } from 'vitest'
import { computeChecks, getServerValidation, parseAmount, toFormValues, toPayload } from './invoice'

const sample = {
  invoice_details: { invoice_number: 'GTC-INV-2026-9842' },
  financial_summary: { subtotal: 7850, discount_amount: 392.5, tax_amount: 1118.63, shipping_amount: 150, total_amount: 8726.13 },
  line_items: [
    { item_code: 'ITM-01', quantity: 1, unit_price: 2500, discount: 100, total: 2400 },
    { item_code: 'ITM-02', quantity: 4, unit_price: 600, discount: 0, total: 2400 },
    { item_code: 'ITM-03', quantity: 2, unit_price: 1250, discount: 250, total: 2250 },
    { item_code: 'ITM-04', quantity: 1, unit_price: 800, discount: 0, total: 800 },
  ],
  custom_flag: 'keep-me',
}

describe('parseAmount', () => {
  it.each([
    ['$8,726.13 USD', 8726.13],
    ['1,234', 1234],
    ['12,50', 12.5],
    ['(45.00)', -45],
    ['', null],
    ['abc', null],
    [7, 7],
  ])('%s -> %s', (input, expected) => expect(parseAmount(input)).toBe(expected))
})

describe('computeChecks', () => {
  it('passes the reference invoice', () => {
    const { checks, hasIssues } = computeChecks(sample)
    expect(checks.map((c) => c.status)).toEqual(['pass', 'pass', 'pass'])
    expect(hasIssues).toBe(false)
  })

  it('flags a wrong line total and total amount', () => {
    const bad = structuredClone(sample)
    bad.line_items[1].total = 2000
    bad.financial_summary.total_amount = 9000
    const { checks, lineIssues } = computeChecks(bad)
    expect(lineIssues[1]).toEqual({ expected: 2400, actual: 2000 })
    expect(checks.find((c) => c.id === 'line_totals').status).toBe('fail')
    expect(checks.find((c) => c.id === 'grand_total').status).toBe('fail')
  })

  it('skips checks it cannot evaluate', () => {
    expect(computeChecks({}).checks.every((c) => c.status === 'skip')).toBe(true)
  })
})

describe('form mapping', () => {
  it('round-trips and preserves unknown keys', () => {
    const payload = toPayload(toFormValues(sample), sample)
    expect(payload.custom_flag).toBe('keep-me')
    expect(payload.financial_summary.total_amount).toBe(8726.13)
    expect(payload.line_items[0].quantity).toBe(1)
    expect(payload.invoice_details.po_number).toBeNull()
  })

  it('applies edits as numbers', () => {
    const values = toFormValues(sample)
    values.financial_summary.total_amount = '$9,000.00'
    expect(toPayload(values, sample).financial_summary.total_amount).toBe(9000)
  })
})

describe('getServerValidation', () => {
  it('reads strings, objects and absence', () => {
    expect(getServerValidation({ math_validation: 'Passed' })).toEqual({ status: 'Passed', messages: [] })
    expect(getServerValidation({ math_validation: { status: 'failed', errors: ['x'] } })).toEqual({ status: 'failed', messages: ['x'] })
    expect(getServerValidation({})).toBeNull()
  })
})
