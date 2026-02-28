import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import LoginPage from '../../pages/LoginPage'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000'

describe('LoginPage', () => {
  beforeEach(() => {
    clearAuthState()
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('renders the login form when not authenticated', async () => {
    renderWithProviders(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    })
    await waitFor(() => {
      expect(screen.getByText('HERMADATA')).toBeInTheDocument()
    })
  })

  it('renders email and password fields', async () => {
    renderWithProviders(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    })
    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
    })
  })

  it('renders the submit button', async () => {
    renderWithProviders(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Accedi/i })).toBeInTheDocument()
    })
  })

  it('shows error message on failed login', async () => {
    server.use(
      http.post(`${BASE_URL}/user/login`, () => {
        return HttpResponse.json(
          { detail: 'Invalid credentials' },
          { status: 401 }
        )
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    const inputs = document.querySelectorAll('input')
    await user.type(inputs[0], 'test@test.com')
    await user.type(inputs[1], 'wrongpassword')

    await user.click(screen.getByRole('button', { name: /Accedi/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Credenziali non valide/i)
      ).toBeInTheDocument()
    })
  })

  it('redirects to home when already authenticated', async () => {
    setupAuthenticatedUser()
    renderWithProviders(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    })
    await waitFor(() => {
      expect(screen.queryByText('HERMADATA')).not.toBeInTheDocument()
    })
  })
})
