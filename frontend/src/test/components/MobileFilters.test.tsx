import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MobileFilters from '../../components/MobileFilters'

const desktopMatchMedia = window.matchMedia

// Emulate a phone: no min-width query matches
const useMobileViewport = () => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: !/min-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

afterEach(() => {
  window.matchMedia = desktopMatchMedia
})

describe('MobileFilters', () => {
  it('renders the filters as they are on desktop', () => {
    const { container } = render(
      <MobileFilters activeCount={2}>
        <span>Presenti</span>
      </MobileFilters>
    )

    expect(screen.getByText('Presenti')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Filtri/ })).not.toBeInTheDocument()
    // No wrapper element, so the desktop layout is untouched
    expect(container.innerHTML).toBe('<span>Presenti</span>')
  })

  it('hides the filters behind a toggle on mobile', async () => {
    useMobileViewport()
    const user = userEvent.setup()
    render(
      <MobileFilters className="filters-block">
        <span>Presenti</span>
      </MobileFilters>
    )

    const toggle = screen.getByRole('button', { name: /Filtri/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Presenti')).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Presenti').parentElement).toHaveClass('filters-block')

    await user.click(toggle)
    expect(screen.queryByText('Presenti')).not.toBeInTheDocument()
  })

  it('shows how many filters are active on mobile', () => {
    useMobileViewport()
    render(
      <MobileFilters activeCount={3}>
        <span>Presenti</span>
      </MobileFilters>
    )

    expect(screen.getByLabelText('3 filtri attivi')).toHaveTextContent('3')
  })

  it('shows no badge when no filter is active', () => {
    useMobileViewport()
    render(
      <MobileFilters activeCount={0}>
        <span>Presenti</span>
      </MobileFilters>
    )

    expect(screen.queryByLabelText(/filtri attivi/)).not.toBeInTheDocument()
  })
})
