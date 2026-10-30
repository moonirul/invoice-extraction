import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extractInvoice, getHealth, listInvoices, saveInvoice } from '@/api/invoices'

export const invoiceKeys = {
  all: ['invoices'],
  list: (params) => [...invoiceKeys.all, 'list', params],
  health: ['health'],
}

export function useInvoices(params) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: ({ signal }) => listInvoices(params, { signal }),
    placeholderData: keepPreviousData, // no table flash while paging/searching
  })
}

export function useExtractInvoice() {
  return useMutation({ mutationFn: (file) => extractInvoice(file) })
}

export function useSaveInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.all }),
  })
}

export function useApiHealth() {
  return useQuery({
    queryKey: invoiceKeys.health,
    queryFn: ({ signal }) => getHealth({ signal }),
    refetchInterval: 30_000,
    retry: false,
  })
}
