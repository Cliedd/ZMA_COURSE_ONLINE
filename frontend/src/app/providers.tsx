import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from '@/shell/ThemeProvider'
import { i18n } from '@/i18n'
import { AppError } from '@/lib/http'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Inutile de réessayer une erreur définitive du client.
      retry: (failureCount, error) => {
        if (error instanceof AppError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>{children}</ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
