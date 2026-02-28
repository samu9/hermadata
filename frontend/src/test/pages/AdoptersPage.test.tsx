import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import AdoptersPage from '../../pages/AdoptersPage'
import { Permission } from '../../constants'

describe('AdoptersPage', () => {
  beforeEach(() => {
    setupAuthenticatedUser(false, [Permission.BROWSE_ADOPTERS])
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('renders the page title "Adottanti"', async () => {
    renderWithProviders(<AdoptersPage />)
    await waitFor(() => {
      expect(screen.getByText('Adottanti')).toBeInTheDocument()
    })
  })

  it('renders the adopter list table', async () => {
    renderWithProviders(<AdoptersPage />)
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })
})
