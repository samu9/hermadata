import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './mocks/server'
import ApiService from '../services/api'

// Mock main.tsx to avoid ReactDOM.createRoot side effect
vi.mock('../main', () => ({
  apiService: new ApiService('http://localhost:8000'),
  router: {},
}))

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
