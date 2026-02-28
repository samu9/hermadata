import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import ProtectedRoute from '../../components/ProtectedRoute'

describe('ProtectedRoute', () => {
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

  it('renders children when authenticated', async () => {
    setupAuthenticatedUser()
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  it('redirects to login when not authenticated', async () => {
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { routerProps: { initialEntries: ['/'] } }
    )
    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })
})
