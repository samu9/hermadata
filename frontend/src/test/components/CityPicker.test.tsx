import { useState } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { renderWithProviders } from '../utils'
import CityPicker from '../../components/forms/city/CityPicker'

const BASE_URL = 'http://localhost:8000'

const province = [
  { id: 'TS', name: 'Trieste' },
  { id: 'UD', name: 'Udine' },
]

const comuni = [
  { id: 'L424', name: 'Trieste', provincia: 'TS' },
  { id: 'D324', name: 'Duino Aurisina', provincia: 'TS' },
  { id: 'L483', name: 'Udine', provincia: 'UD' },
  { id: 'H929', name: 'San Giorgio di Nogaro', provincia: 'UD' },
]

const Picker = (props: {
  initial?: string | null
  onChange?: (code: string | null) => void
}) => {
  const [value, setValue] = useState<string | null>(props.initial ?? null)
  return (
    <CityPicker
      id="city"
      value={value}
      onChange={(code) => {
        setValue(code)
        props.onChange?.(code)
      }}
    />
  )
}

const provinciaInput = () => screen.getByLabelText('Provincia')
const comuneInput = () => screen.getByLabelText('Comune')

describe('CityPicker', () => {
  beforeEach(() => {
    server.use(
      http.get(`${BASE_URL}/util/province`, () =>
        HttpResponse.json(province),
      ),
      http.get(`${BASE_URL}/util/comuni`, () => HttpResponse.json(comuni)),
    )
  })

  it('suggests comuni of any provincia while typing and fills the provincia', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<Picker onChange={onChange} />)

    await waitFor(() => expect(comuneInput()).toBeEnabled())
    await user.type(comuneInput(), 'sangior')
    await user.click(await screen.findByText('San Giorgio di Nogaro'))

    expect(onChange).toHaveBeenLastCalledWith('H929')
    expect(comuneInput()).toHaveValue('San Giorgio di Nogaro')
    expect(provinciaInput()).toHaveValue('Udine')
  })

  it('only suggests comuni of the chosen provincia', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Picker />)

    await waitFor(() => expect(comuneInput()).toBeEnabled())
    await user.type(provinciaInput(), 'ts')
    await user.click(await screen.findByText('Trieste'))
    expect(provinciaInput()).toHaveValue('Trieste')

    await user.type(comuneInput(), 'i')
    expect(await screen.findByText('Duino Aurisina')).toBeInTheDocument()
    expect(screen.queryByText('Udine')).not.toBeInTheDocument()
  })

  it('clears the comune when switching to another provincia', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<Picker initial="L424" onChange={onChange} />)

    await waitFor(() => expect(comuneInput()).toHaveValue('Trieste'))
    expect(provinciaInput()).toHaveValue('Trieste')

    await user.clear(provinciaInput())
    await user.type(provinciaInput(), 'udi')
    await user.click(await screen.findByText('Udine'))

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(comuneInput()).toHaveValue('')
  })

  it('reverts unselected text on blur, and accepts an exact name', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<Picker onChange={onChange} />)

    await waitFor(() => expect(comuneInput()).toBeEnabled())
    await user.type(comuneInput(), 'xyz')
    await user.tab()
    expect(comuneInput()).toHaveValue('')
    expect(onChange).not.toHaveBeenCalled()

    await user.type(comuneInput(), 'udine')
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith('L483')
    expect(comuneInput()).toHaveValue('Udine')
  })
})
