import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuthState } from '../utils'
import LoggedUserCard from '../../components/LoggedUserCard'
import SideMenu from '../../components/layout/SideMenu'
import { Permission } from '../../constants'

describe('LoggedUserCard', () => {
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

  it('renders nothing when not authenticated', async () => {
    const { container } = renderWithProviders(<LoggedUserCard />)
    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('renders username when authenticated', async () => {
    setupAuthenticatedUser(false)
    renderWithProviders(<LoggedUserCard />)
    await waitFor(() => {
      expect(screen.getByText('test@hermadata.it')).toBeInTheDocument()
    })
  })

  it('shows "Superuser" badge for superuser', async () => {
    setupAuthenticatedUser(true)
    renderWithProviders(<LoggedUserCard />)
    await waitFor(() => {
      expect(screen.getByText('Superuser')).toBeInTheDocument()
    })
  })

  it('hides "Superuser" badge for regular user', async () => {
    setupAuthenticatedUser(false)
    renderWithProviders(<LoggedUserCard />)
    await waitFor(() => {
      expect(screen.queryByText('Superuser')).not.toBeInTheDocument()
    })
  })

  it('renders logout button', async () => {
    setupAuthenticatedUser(false)
    renderWithProviders(<LoggedUserCard />)
    await waitFor(() => {
      expect(
        document.querySelector('.pi-sign-out')
      ).toBeInTheDocument()
    })
  })
})

describe('SideMenu', () => {
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

  it('renders the Hermadata logo text', async () => {
    setupAuthenticatedUser(false, [])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.getByText('Hermadata')).toBeInTheDocument()
    })
  })

  it('always renders the "Bacheca" and "Animali" menu items', async () => {
    setupAuthenticatedUser(false, [])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.getByText('Bacheca')).toBeInTheDocument()
      expect(screen.getByText('Animali')).toBeInTheDocument()
    })
  })

  it('shows "Adottanti" menu item when user has BROWSE_ADOPTERS permission', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_ADOPTERS])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.getByText('Adottanti')).toBeInTheDocument()
    })
  })

  it('hides "Adottanti" menu item without BROWSE_ADOPTERS permission', async () => {
    setupAuthenticatedUser(false, [])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.queryByText('Adottanti')).not.toBeInTheDocument()
    })
  })

  it('shows "Veterinari" menu item when user has BROWSE_VETS permission', async () => {
    setupAuthenticatedUser(false, [Permission.BROWSE_VETS])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.getByText('Veterinari')).toBeInTheDocument()
    })
  })

  it('shows "Pannello Admin" for superusers', async () => {
    setupAuthenticatedUser(true)
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.getByText('Pannello Admin')).toBeInTheDocument()
    })
  })

  it('hides "Pannello Admin" for regular users', async () => {
    setupAuthenticatedUser(false, [])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.queryByText('Pannello Admin')).not.toBeInTheDocument()
    })
  })

  it('shows "Estrazioni" for users with DOWNLOAD_SUMMARY permission', async () => {
    setupAuthenticatedUser(false, [Permission.DOWNLOAD_SUMMARY])
    renderWithProviders(<SideMenu />)
    await waitFor(() => {
      expect(screen.getByText('Estrazioni')).toBeInTheDocument()
    })
  })
})
