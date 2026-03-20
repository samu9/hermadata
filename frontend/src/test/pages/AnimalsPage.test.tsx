import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import AnimalsPage from '../../pages/AnimalsPage'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { Permission } from '../../constants'

const BASE_URL = 'http://localhost:8000'

describe('AnimalsPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location)
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('renders the page title "Animali"', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText('Animali')).toBeInTheDocument()
    })
  })

  it('renders the animal list table', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('renders table column headers', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument()
      expect(screen.getByText('Chip')).toBeInTheDocument()
      expect(screen.getByText('Provenienza')).toBeInTheDocument()
      expect(screen.getByText('Data ingresso')).toBeInTheDocument()
    })
  })

  it('shows "Nessun risultato trovato" when no animals found', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    server.use(
      http.get(`${BASE_URL}/animal/search`, () => {
        return HttpResponse.json({ total: 0, items: [] })
      })
    )
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText('Nessun risultato trovato')).toBeInTheDocument()
    })
  })

  it('shows the "Nuovo animale" button for users with CREATE_ANIMAL permission', async () => {
    setupAuthenticatedUser(false, [
      Permission.BROWSE_PRESENT_ANIMALS,
      Permission.CREATE_ANIMAL,
    ])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText(/Nuovo animale/i)).toBeInTheDocument()
    })
  })

  it('hides the "Nuovo animale" button for users without CREATE_ANIMAL permission', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(
        screen.queryByText(/Nuovo animale/i)
      ).not.toBeInTheDocument()
    })
  })

  it('shows filter switches for users with both present and not-present permissions', async () => {
    setupAuthenticatedUser(false, [
      Permission.BROWSE_PRESENT_ANIMALS,
      Permission.BROWSE_NOT_PRESENT_ANIMALS,
    ])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText('Presenti')).toBeInTheDocument()
      expect(screen.getByText('Non presenti')).toBeInTheDocument()
    })
  })

  it('always shows healthcare and shelter stage filters', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText('Sanitario')).toBeInTheDocument()
      expect(screen.getByText('Rifugio')).toBeInTheDocument()
    })
  })

  it('always shows animal type filters (Cani/Gatti)', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_PRESENT_ANIMALS])
    renderWithProviders(<AnimalsPage />)
    await waitFor(() => {
      expect(screen.getByText('Cani')).toBeInTheDocument()
      expect(screen.getByText('Gatti')).toBeInTheDocument()
    })
  })
})
