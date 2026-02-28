import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import NotFoundPage from '../../pages/NotFoundPage'

describe('PageWrapper', () => {
  it('renders children inside the wrapper', () => {
    render(
      <PageWrapper>
        <div data-testid="child">Hello World</div>
      </PageWrapper>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <PageWrapper>
        <div data-testid="child1">First</div>
        <div data-testid="child2">Second</div>
      </PageWrapper>
    )
    expect(screen.getByTestId('child1')).toBeInTheDocument()
    expect(screen.getByTestId('child2')).toBeInTheDocument()
  })
})

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders the "Pagina Non Trovata" text', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Pagina Non Trovata')).toBeInTheDocument()
  })

  it('renders a link to return home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    const link = screen.getByText('Torna alla Home')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders the construction message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText(/In Costruzione/)).toBeInTheDocument()
  })
})
