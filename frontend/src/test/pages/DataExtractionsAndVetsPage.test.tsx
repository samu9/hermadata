import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import DataExtractionsPage from '../../pages/DataExtractionsPage'
import VetsPage from '../../pages/VetsPage'

describe('DataExtractionsPage', () => {
  beforeEach(() => {
    setupAuthenticatedUser(false, ['DS'])
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('renders the animal days report form', async () => {
    renderWithProviders(<DataExtractionsPage />)
    await waitFor(() => {
      expect(screen.getByText('Report giorni animale')).toBeInTheDocument()
    })
  })

  it('renders the animal entries report form', async () => {
    renderWithProviders(<DataExtractionsPage />)
    await waitFor(() => {
      expect(screen.getByText('Report ingressi')).toBeInTheDocument()
    })
  })

  it('renders the animal exits report form', async () => {
    renderWithProviders(<DataExtractionsPage />)
    await waitFor(() => {
      expect(screen.getByText('Report uscite')).toBeInTheDocument()
    })
  })

  it('renders download buttons', async () => {
    renderWithProviders(<DataExtractionsPage />)
    await waitFor(() => {
      const downloadButtons = screen.getAllByText('Scarica Report')
      expect(downloadButtons.length).toBeGreaterThanOrEqual(1)
    })
  })
})

describe('VetsPage', () => {
  beforeEach(() => {
    setupAuthenticatedUser(false, ['BAV'])
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('renders the page title "Veterinari"', async () => {
    renderWithProviders(<VetsPage />)
    await waitFor(() => {
      expect(screen.getByText('Veterinari')).toBeInTheDocument()
    })
  })

  it('renders the vet list table', async () => {
    renderWithProviders(<VetsPage />)
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('renders the "Nuovo veterinario" button', async () => {
    renderWithProviders(<VetsPage />)
    await waitFor(() => {
      expect(screen.getByText('Nuovo veterinario')).toBeInTheDocument()
    })
  })
})
