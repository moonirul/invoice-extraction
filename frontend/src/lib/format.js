export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatMoney(value, currency) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '—'
  const amount = Number(value)
  const code = typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency.trim()) ? currency.trim().toUpperCase() : null
  try {
    return new Intl.NumberFormat(undefined, code ? { style: 'currency', currency: code } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return amount.toFixed(2)
  }
}
