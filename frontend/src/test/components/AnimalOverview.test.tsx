import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from 'react-query'
import { PrimeReactProvider } from 'primereact/api'
import { AuthProvider } from '../../contexts/AuthContext'
import { LoaderProvider } from '../../contexts/Loader'
import { setupAuthenticatedUser, clearAuthState, createTestQueryClient } from '../utils'
import AnimalOverview from '../../components/animal/AnimalOverview'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000'

const mockAnimalData = {
  code: 'C0012345678AB',
  name: 'Fido',
  race_id: 'C',
  breed_id: null,
  sterilized: false,
  entry_date: '2024-01-15',
  entry_type: 'R',
  exit_date: null,
  exit_type: null,
  birth_date: '2020-06-15',
  stage: null,
  adoptability_index: 0,
  chip_code: null,
  chip_code_set: false,
  img_path: null,
  sex: 0,
  notes: 'Some test notes',
  fur: 1,
  size: 2,
  color: 1,
  in_shelter_from: null,
  healthcare_stage: false,
  without_chip: false,
}

function renderAnimalOverview(animalId = '1') {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider value={{}}>
        <MemoryRouter initialEntries={[`/animal/${animalId}/overview`]}>
          <AuthProvider>
            <LoaderProvider>
              <Routes>
                <Route path="/animal/:id/overview" element={<AnimalOverview />} />
              </Routes>
            </LoaderProvider>
          </AuthProvider>
        </MemoryRouter>
      </PrimeReactProvider>
    </QueryClientProvider>
  )
}

describe('AnimalOverview', () => {
  beforeEach(() => {
    setupAuthenticatedUser(false, ['EAN', 'BPA'])
  })

  afterEach(() => {
    clearAuthState()
    vi.restoreAllMocks()
  })

  it('shows loading state initially', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json(mockAnimalData)
      })
    )
    renderAnimalOverview('1')
    expect(screen.getByText('Caricamento...')).toBeInTheDocument()
  })

  it('renders animal details after loading', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, () => {
        return HttpResponse.json(mockAnimalData)
      })
    )
    renderAnimalOverview('1')
    await waitFor(() => {
      expect(screen.getByText('Informazioni Generali')).toBeInTheDocument()
      expect(screen.getByText('Caratteristiche Fisiche')).toBeInTheDocument()
    })
  })

  it('shows animal name in the overview', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, () => {
        return HttpResponse.json(mockAnimalData)
      })
    )
    renderAnimalOverview('1')
    await waitFor(() => {
      expect(screen.getByText('Fido')).toBeInTheDocument()
    })
  })

  it('shows sex as "Maschio" for sex=0', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, () => {
        return HttpResponse.json({ ...mockAnimalData, sex: 0 })
      })
    )
    renderAnimalOverview('1')
    await waitFor(() => {
      expect(screen.getByText('Maschio')).toBeInTheDocument()
    })
  })

  it('shows "Dati non disponibili" when animal returns null', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, () => {
        return HttpResponse.json(null)
      })
    )
    renderAnimalOverview('999')
    await waitFor(() => {
      expect(screen.getByText('Dati non disponibili')).toBeInTheDocument()
    })
  })

  it('shows notes section when animal has notes', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, () => {
        return HttpResponse.json({ ...mockAnimalData, notes: 'Test note' })
      })
    )
    renderAnimalOverview('1')
    await waitFor(() => {
      expect(screen.getByText('Note')).toBeInTheDocument()
      expect(screen.getByText('Test note')).toBeInTheDocument()
    })
  })

  it('shows "Date ed Ingresso" section', async () => {
    server.use(
      http.get(`${BASE_URL}/animal/:id`, () => {
        return HttpResponse.json(mockAnimalData)
      })
    )
    renderAnimalOverview('1')
    await waitFor(() => {
      expect(screen.getByText('Date ed Ingresso')).toBeInTheDocument()
    })
  })
})

