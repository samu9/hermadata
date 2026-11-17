import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import {
  renderWithProviders,
  setupAuthenticatedUser,
  clearAuthState,
} from '../utils'
import FavouriteComuniPage from '../../pages/FavouriteComuniPage'

const BASE_URL = 'http://localhost:8000'

const comuni = [
  { id: 'G491', name: 'Pescia', provincia: 'PT', favourite: true },
  { id: 'H501', name: 'Roma', provincia: 'RM', favourite: false },
]

describe('FavouriteComuniPage', () => {
  beforeEach(() => {
    setupAuthenticatedUser(true)
    server.use(
      http.get(`${BASE_URL}/util/comuni`, () => HttpResponse.json(comuni)),
    )
  })

  afterEach(() => {
    clearAuthState()
  })

  it('lists only the favourite comuni', async () => {
    renderWithProviders(<FavouriteComuniPage />)

    await waitFor(() => {
      expect(screen.getByText('Pescia')).toBeInTheDocument()
    })
    expect(screen.queryByText('Roma')).not.toBeInTheDocument()
  })

  it('removes a comune from the favourites', async () => {
    let request: { code: string; favourite: boolean } | undefined
    server.use(
      http.put(
        `${BASE_URL}/util/comune/:code/favourite`,
        async ({ params, request: req }) => {
          const body = (await req.json()) as { favourite: boolean }
          request = { code: params.code as string, ...body }
          return HttpResponse.json({ ...comuni[0], favourite: false })
        },
      ),
    )
    renderWithProviders(<FavouriteComuniPage />)

    const remove = await screen.findByLabelText(
      'Rimuovi Pescia dai preferiti',
    )
    await userEvent.click(remove)

    await waitFor(() => {
      expect(request).toEqual({ code: 'G491', favourite: false })
    })
  })
})
