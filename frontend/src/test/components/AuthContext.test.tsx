import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000'

const TestComponent = () => {
  const { isAuthenticated, user, loading, isSuperUser } = useAuth()
  if (loading) return <div>Loading...</div>
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="username">{user?.username || 'none'}</div>
      <div data-testid="superuser">{isSuperUser.toString()}</div>
    </div>
  )
}

function renderWithAuth(initialAuth = false) {
  if (initialAuth) {
    localStorage.setItem('accessToken', 'mock-token')
    localStorage.setItem('tokenTimestamp', Date.now().toString())
    localStorage.setItem(
      'userData',
      JSON.stringify({
        username: 'test@hermadata.it',
        is_superuser: false,
        role: 'operator',
        permissions: [],
      })
    )
  }
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts unauthenticated with no stored token', async () => {
    renderWithAuth(false)
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false')
    })
  })

  it('starts authenticated when a valid token is in localStorage', async () => {
    renderWithAuth(true)
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true')
    })
  })

  it('loads user from localStorage when token exists', async () => {
    renderWithAuth(true)
    await waitFor(() => {
      expect(screen.getByTestId('username').textContent).toBe(
        'test@hermadata.it'
      )
    })
  })

  it('reflects isSuperUser correctly for non-superuser', async () => {
    renderWithAuth(true)
    await waitFor(() => {
      expect(screen.getByTestId('superuser').textContent).toBe('false')
    })
  })

  it('reflects isSuperUser correctly for superuser', async () => {
    localStorage.setItem('accessToken', 'mock-token')
    localStorage.setItem('tokenTimestamp', Date.now().toString())
    localStorage.setItem(
      'userData',
      JSON.stringify({
        username: 'admin@hermadata.it',
        is_superuser: true,
        role: 'admin',
        permissions: [],
      })
    )
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByTestId('superuser').textContent).toBe('true')
    })
  })
})

describe('AuthContext - login', () => {
  const LoginTest = () => {
    const { login, isAuthenticated, user } = useAuth()
    const [error, setError] = React.useState('')
    return (
      <div>
        <div data-testid="authenticated">{isAuthenticated.toString()}</div>
        <div data-testid="username">{user?.username || 'none'}</div>
        <div data-testid="error">{error}</div>
        <button
          onClick={async () => {
            const ok = await login('admin@hermadata.it', 'password')
            if (!ok) setError('Login failed')
          }}
        >
          Login
        </button>
        <button
          onClick={async () => {
            const ok = await login('bad@user.com', 'wrong')
            if (!ok) setError('Login failed')
          }}
        >
          Bad Login
        </button>
      </div>
    )
  }

  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('sets isAuthenticated to true after successful login', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginTest />
        </AuthProvider>
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('false')
    )
    await act(async () => {
      screen.getByText('Login').click()
    })
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true')
    })
  })

  it('sets error when login fails', async () => {
    server.use(
      http.post(`${BASE_URL}/user/login`, () => {
        return HttpResponse.json(
          { detail: 'Invalid credentials' },
          { status: 401 }
        )
      })
    )
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginTest />
        </AuthProvider>
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('false')
    )
    await act(async () => {
      screen.getByText('Bad Login').click()
    })
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Login failed')
    })
  })
})

// Import React for JSX
import React from 'react'
