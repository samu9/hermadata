import { describe, it, expect, act } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoaderProvider, useLoader } from '../../contexts/Loader'
import Loader from '../../components/Loader'

const LoaderTrigger = () => {
  const { startLoading, stopLoading } = useLoader()
  return (
    <div>
      <button onClick={startLoading}>Start Loading</button>
      <button onClick={stopLoading}>Stop Loading</button>
    </div>
  )
}

describe('LoaderProvider', () => {
  it('provides loading context to children', () => {
    render(
      <LoaderProvider>
        <Loader />
        <LoaderTrigger />
      </LoaderProvider>
    )
    // Loader should be hidden initially
    expect(document.querySelector('.p-progress-spinner')).not.toBeInTheDocument()
  })

  it('shows loader when startLoading is called', async () => {
    const user = userEvent.setup()
    render(
      <LoaderProvider>
        <Loader />
        <LoaderTrigger />
      </LoaderProvider>
    )
    await user.click(screen.getByText('Start Loading'))
    expect(document.querySelector('.p-progress-spinner')).toBeInTheDocument()
  })

  it('hides loader when stopLoading is called', async () => {
    const user = userEvent.setup()
    render(
      <LoaderProvider>
        <Loader />
        <LoaderTrigger />
      </LoaderProvider>
    )
    await user.click(screen.getByText('Start Loading'))
    expect(document.querySelector('.p-progress-spinner')).toBeInTheDocument()
    await user.click(screen.getByText('Stop Loading'))
    expect(document.querySelector('.p-progress-spinner')).not.toBeInTheDocument()
  })
})
