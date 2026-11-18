import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import {
  renderWithProviders,
  setupAuthenticatedUser,
  clearAuthState,
} from '../utils'
import AnimalOverviewReportForm from '../../components/AnimalOverviewReportForm'
import { server } from '../mocks/server'
import { mockComuni } from '../mocks/data'

const withFavourites = (codes: string[]) =>
  server.use(
    http.get('*/util/comuni', () =>
      HttpResponse.json(
        mockComuni.map((c) => ({ ...c, favourite: codes.includes(c.id) }))
      )
    )
  )

const button = (name: string, index = 0) =>
  screen.getAllByRole('button', { name })[index]

const renderForm = async () => {
  renderWithProviders(<AnimalOverviewReportForm />)
  await waitFor(() => expect(button('Tutti')).toBeEnabled())
}

describe('AnimalOverviewReportForm quick selections', () => {
  beforeEach(() => {
    setupAuthenticatedUser(true, [])
  })

  afterEach(() => {
    clearAuthState()
  })

  it('selects and clears all the entry types', async () => {
    await renderForm()
    // entry types come first, exit types second
    expect(button('Nessuno', 0)).toBeDisabled()

    fireEvent.click(button('Tutti', 0))

    await waitFor(() => {
      expect(screen.getByText('Ritrovato')).toBeInTheDocument()
    })
    expect(screen.getByText('Sequestrato')).toBeInTheDocument()
    expect(screen.getByText('Volontario')).toBeInTheDocument()
    expect(button('Tutti', 0)).toBeDisabled()

    fireEvent.click(button('Nessuno', 0))
    await waitFor(() => {
      expect(screen.queryByText('Ritrovato')).not.toBeInTheDocument()
    })
  })

  it('selects all the exit types', async () => {
    await renderForm()

    fireEvent.click(button('Tutti', 1))

    await waitFor(() => {
      expect(screen.getByText('Deceduto')).toBeInTheDocument()
    })
    expect(screen.getByText('Reimmesso sul territorio')).toBeInTheDocument()
    expect(button('Tutti', 1)).toBeDisabled()
  })

  it('adds all the favourite comuni', async () => {
    withFavourites(['H501', 'F205'])
    await renderForm()
    await waitFor(() => expect(button('Tutti i preferiti')).toBeEnabled())

    fireEvent.click(button('Tutti i preferiti'))

    await waitFor(() => {
      expect(screen.getByText('Roma (RM)')).toBeInTheDocument()
    })
    expect(screen.getByText('Milano (MI)')).toBeInTheDocument()
    expect(button('Tutti i preferiti')).toBeDisabled()

    fireEvent.click(button('Svuota'))
    await waitFor(() => {
      expect(screen.queryByText('Roma (RM)')).not.toBeInTheDocument()
    })
  })

  it('disables the favourites shortcut when there are none', async () => {
    withFavourites([])
    await renderForm()

    expect(button('Tutti i preferiti')).toBeDisabled()
  })

  it('only adds the favourites a restricted user can extract', async () => {
    localStorage.setItem(
      'userData',
      JSON.stringify({
        username: 'operator@hermadata.it',
        is_superuser: false,
        role: 'operator',
        permissions: [],
        city_codes: ['F205'],
      })
    )
    withFavourites(['H501', 'F205'])
    await renderForm()
    await waitFor(() => expect(button('Tutti i preferiti')).toBeEnabled())

    fireEvent.click(button('Tutti i preferiti'))

    await waitFor(() => {
      expect(screen.getByText('Milano (MI)')).toBeInTheDocument()
    })
    expect(screen.queryByText('Roma (RM)')).not.toBeInTheDocument()
  })
})
