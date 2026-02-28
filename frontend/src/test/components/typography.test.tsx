import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  PageTitle,
  SubTitle,
  SectionTitle,
  InputLabel,
} from '../../components/typography'

describe('PageTitle', () => {
  it('renders children as h1', () => {
    render(<PageTitle>Test Title</PageTitle>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Title')
  })

  it('applies custom className', () => {
    render(<PageTitle className="custom-class">Title</PageTitle>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('custom-class')
  })
})

describe('SubTitle', () => {
  it('renders children as h3', () => {
    render(<SubTitle>Sub Title</SubTitle>)
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Sub Title')
  })
})

describe('SectionTitle', () => {
  it('renders children as h4', () => {
    render(<SectionTitle>Section</SectionTitle>)
    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Section')
  })
})

describe('InputLabel', () => {
  it('renders a label element', () => {
    render(<InputLabel>Email</InputLabel>)
    const label = screen.getByText('Email')
    expect(label.tagName).toBe('LABEL')
  })

  it('associates with an input via htmlFor', () => {
    render(
      <div>
        <InputLabel htmlFor="email">Email</InputLabel>
        <input id="email" />
      </div>
    )
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email')
  })
})
