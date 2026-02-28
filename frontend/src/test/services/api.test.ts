import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import ApiService from '../../services/api'
import {
  mockLoginResponse,
  mockRaces,
  mockEntryTypes,
  mockExitTypes,
  mockPaginatedAnimals,
  mockAnimalSizes,
  mockAnimalFurTypes,
  mockAnimalFurColors,
  mockProvince,
  mockComuni,
} from '../mocks/data'

const BASE_URL = 'http://localhost:8000'

describe('ApiService', () => {
  let api: ApiService

  beforeEach(() => {
    api = new ApiService(BASE_URL)
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('authentication', () => {
    it('isAuthenticated returns false when no token is stored', () => {
      expect(api.isAuthenticated()).toBe(false)
    })

    it('isAuthenticated returns true when a valid token is stored', () => {
      localStorage.setItem('accessToken', 'test-token')
      localStorage.setItem('tokenTimestamp', Date.now().toString())
      expect(api.isAuthenticated()).toBe(true)
    })

    it('isAuthenticated returns false for expired token (>24h)', () => {
      localStorage.setItem('accessToken', 'test-token')
      const expired = Date.now() - 25 * 60 * 60 * 1000
      localStorage.setItem('tokenTimestamp', expired.toString())
      expect(api.isAuthenticated()).toBe(false)
    })

    it('getAccessToken returns null when not authenticated', () => {
      expect(api.getAccessToken()).toBeNull()
    })

    it('getAccessToken returns token when authenticated', () => {
      localStorage.setItem('accessToken', 'my-token')
      localStorage.setItem('tokenTimestamp', Date.now().toString())
      expect(api.getAccessToken()).toBe('my-token')
    })

    it('logout removes auth data from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token')
      localStorage.setItem('tokenTimestamp', Date.now().toString())
      api.logout()
      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('tokenTimestamp')).toBeNull()
    })

    it('login stores token in localStorage', async () => {
      const result = await api.login({
        username: 'admin@hermadata.it',
        password: 'password',
      })
      expect(result.access_token).toBe(mockLoginResponse.access_token)
      expect(localStorage.getItem('accessToken')).toBe(
        mockLoginResponse.access_token
      )
    })
  })

  describe('races', () => {
    it('getRaces returns parsed race list', async () => {
      const races = await api.getRaces()
      expect(races).toHaveLength(mockRaces.length)
      expect(races[0].id).toBe('C')
      expect(races[0].name).toBe('Cane')
    })
  })

  describe('entry/exit types', () => {
    it('getEntryTypes returns entry types', async () => {
      const types = await api.getEntryTypes()
      expect(types).toHaveLength(mockEntryTypes.length)
      expect(types[0].id).toBe('R')
    })

    it('getExitTypes returns exit types', async () => {
      const types = await api.getExitTypes()
      expect(types).toHaveLength(mockExitTypes.length)
      expect(types[0].id).toBe('A')
    })
  })

  describe('animals', () => {
    it('searchAnimals returns paginated results', async () => {
      const result = await api.searchAnimals({ from_index: 0, to_index: 10 })
      expect(result.total).toBe(mockPaginatedAnimals.total)
      expect(result.items).toHaveLength(mockPaginatedAnimals.items.length)
    })

    it('createAnimal posts to animal endpoint', async () => {
      const code = await api.createAnimal({
        rescue_city_code: 'H501',
        entry_type: 'R',
      })
      expect(code).toBe('C999')
    })
  })

  describe('utility endpoints', () => {
    it('getAnimalSizes returns sizes', async () => {
      const sizes = await api.getAnimalSizes()
      expect(sizes).toHaveLength(mockAnimalSizes.length)
    })

    it('getAnimalFurTypes returns fur types', async () => {
      const types = await api.getAnimalFurTypes()
      expect(types).toHaveLength(mockAnimalFurTypes.length)
    })

    it('getAnimalFurColors returns fur colors', async () => {
      const colors = await api.getAnimalFurColors()
      expect(colors).toHaveLength(mockAnimalFurColors.length)
    })

    it('getProvince returns province list', async () => {
      const provinces = await api.getProvince()
      expect(provinces).toHaveLength(mockProvince.length)
      expect(provinces[0].id).toBe('RM')
    })

    it('getComuni returns comuni for a province', async () => {
      const comuni = await api.getComuni('RM')
      expect(comuni).toHaveLength(mockComuni.length)
    })
  })
})
