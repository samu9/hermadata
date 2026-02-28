import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import { AuthProvider } from '../contexts/AuthContext'
import { LoaderProvider } from '../contexts/Loader'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps
  queryClient?: QueryClient
}

function AllProviders({
  children,
  routerProps,
  queryClient,
}: {
  children: React.ReactNode
  routerProps?: MemoryRouterProps
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider value={{}}>
        <MemoryRouter {...routerProps}>
          <AuthProvider>
            <LoaderProvider>{children}</LoaderProvider>
          </AuthProvider>
        </MemoryRouter>
      </PrimeReactProvider>
    </QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  {
    routerProps = { initialEntries: ['/'] },
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AllProviders routerProps={routerProps} queryClient={queryClient}>
        {children}
      </AllProviders>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export function setupAuthenticatedUser(
  isSuperUser = false,
  permissions: string[] = []
) {
  const userData = {
    username: 'test@hermadata.it',
    is_superuser: isSuperUser,
    role: isSuperUser ? 'admin' : 'operator',
    permissions,
  }
  localStorage.setItem('accessToken', 'mock-token')
  localStorage.setItem('tokenTimestamp', Date.now().toString())
  localStorage.setItem('userData', JSON.stringify(userData))
  return userData
}

export function clearAuthState() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('tokenTimestamp')
  localStorage.removeItem('userData')
}
