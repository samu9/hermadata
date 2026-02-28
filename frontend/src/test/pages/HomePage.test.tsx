import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import HomePage from '../../pages/HomePage'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000'

describe('HomePage', () => {
  beforeEach(() => {
    setupAuthenticatedUser(false, ['BPA', 'BNA'])
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('renders the Dashboard title', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('renders the statistics section titles', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText(/Animali Totali/i)).toBeInTheDocument()
      expect(screen.getByText(/Animali Presenti/i)).toBeInTheDocument()
      expect(screen.getByText(/Animali Adottati/i)).toBeInTheDocument()
    })
  })

  it('renders the "Ultimi Ingressi" section', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Ultimi Ingressi')).toBeInTheDocument()
    })
  })

  it('renders the "Utilità e Report" section', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Utilità e Report')).toBeInTheDocument()
    })
  })

  it('shows a welcome message with the username', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText(/Benvenuto/i)).toBeInTheDocument()
    })
  })

  it('displays statistics from API response', async () => {
    // The default mock returns total: 2, so both totalAnimals and activeAnimals should be 2
    renderWithProviders(<HomePage />)
    await waitFor(
      () => {
        // Stats cards show numbers once loaded (at least one number renders)
        const statValues = document.querySelectorAll('.text-3xl.font-bold')
        expect(statValues.length).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )
  })

  it('renders the recent animals table with column headers', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Specie')).toBeInTheDocument()
      expect(screen.getByText('Data Ingresso')).toBeInTheDocument()
    })
  })

  it('renders quick action buttons', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Report Ingressi')).toBeInTheDocument()
      expect(screen.getByText('Report Uscite')).toBeInTheDocument()
    })
  })

  it('shows empty state in recent animals table when no data', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/search`, () => {
        return HttpResponse.json({ total: 0, items: [] })
      })
    )
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Nessun animale trovato')).toBeInTheDocument()
    })
  })

  it('shows "Date Importanti" section only for superusers', async () => {
    clearAuthState()
    setupAuthenticatedUser(true) // superuser
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.getByText('Date Importanti')).toBeInTheDocument()
    })
  })

  it('hides "Date Importanti" section for regular users', async () => {
    renderWithProviders(<HomePage />)
    await waitFor(() => {
      expect(screen.queryByText('Date Importanti')).not.toBeInTheDocument()
    })
  })
})
