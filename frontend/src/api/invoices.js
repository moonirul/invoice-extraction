import { http } from './client'

export async function extractInvoice(file, { signal } = {}) {
  const body = new FormData()
  body.append('file', file)
  // Don't set Content-Type: the browser adds the multipart boundary.
  const { data } = await http.post('/invoices/extract', body, { signal })
  return data
}

export async function saveInvoice(invoice) {
  const { data } = await http.post('/invoices', invoice)
  return data
}

export async function listInvoices({ page = 1, pageSize = 10, q = '' } = {}, { signal } = {}) {
  const { data } = await http.get('/invoices', {
    params: { page, page_size: pageSize, q: q || undefined },
    signal,
  })
  return data
}

export async function getHealth({ signal } = {}) {
  const { data } = await http.get('/health', { signal, timeout: 5000 })
  return data
}
