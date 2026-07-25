import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/router'
import { Providers } from './app/providers'
import { ErrorBoundary } from './app/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <AppRoutes />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
