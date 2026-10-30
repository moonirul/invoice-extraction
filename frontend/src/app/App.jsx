import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import { Providers } from './providers'

export default function App() {
  return (
    <ErrorBoundary title="The application crashed">
      <Providers>
        <AppShell>
          <DashboardPage />
        </AppShell>
      </Providers>
    </ErrorBoundary>
  )
}
