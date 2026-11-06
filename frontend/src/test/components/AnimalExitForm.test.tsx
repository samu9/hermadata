import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import {
  renderWithProviders,
  setupAuthenticatedUser,
  clearAuthState,
} from '../utils'
import AnimalExitForm from '../../components/animal/AnimalExitForm'
import { ToolbarProvider } from '../../contexts/Toolbar'
import { server } from '../mocks/server'
import { mockAdopters } from '../mocks/data'

const addressInput = () =>
  document.getElementById('location_address') as HTMLInputElement | null

const renderForm = () => {
  server.use(
    http.get('*/adopter/:id', ({ params }) =>
      params.id === 'search' ? undefined : HttpResponse.json(mockAdopters[0])
    )
  )
  renderWithProviders(
    <ToolbarProvider>
      <Routes>
        <Route path="/animal/:id/exit" element={<AnimalExitForm />} />
      </Routes>
    </ToolbarProvider>,
    { routerProps: { initialEntries: ['/animal/1/exit'] } }
  )
}

const searchAndPickAdopter = async () => {
  const fiscalCodeInput = screen
    .getByText(/Codice Fiscale/)
    .closest('div')!
    .parentElement!.querySelector('input') as HTMLInputElement
  await userEvent.type(fiscalCodeInput, 'RSS')
  await userEvent.click(screen.getByRole('button', { name: /Cerca$/ }))
  fireEvent.click(await screen.findByText(mockAdopters[0].fiscal_code))
  await screen.findByText(/Adottante Selezionato/)
}

describe('AnimalExitForm detention steps', () => {
  beforeEach(() => {
    setupAuthenticatedUser(true, [])
    // Start with an adoption exit type, skipping the dropdown interaction
    localStorage.setItem(
      'animal-exit-form-1',
      JSON.stringify({
        timestamp: Date.now(),
        data: { animal_id: 1, exit_type: 'A' },
      })
    )
  })

  afterEach(() => {
    clearAuthState()
    localStorage.clear()
  })

  it('locks the detention step until an adopter is selected', async () => {
    renderForm()
    await screen.findByText('Luogo di detenzione')
    expect(addressInput()).toBeNull()
    expect(screen.getByText(/Seleziona o crea prima/)).toBeInTheDocument()

    await searchAndPickAdopter()

    expect(addressInput()).not.toBeNull()
  })

  it('keeps the detention data when the adopter is changed', async () => {
    renderForm()
    await screen.findByText('Luogo di detenzione')
    await searchAndPickAdopter()
    await userEvent.type(addressInput()!, 'Via Roma 1')

    await userEvent.click(screen.getByRole('button', { name: 'Cambia' }))
    expect(addressInput()).toBeNull()

    await searchAndPickAdopter()
    await waitFor(() => expect(addressInput()!.value).toBe('Via Roma 1'))
  })
})
