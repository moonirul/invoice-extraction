import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
          mutations: { retry: 0 }, // never auto-retry extract/save: they have side effects and cost
        },
      }),
  )
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
