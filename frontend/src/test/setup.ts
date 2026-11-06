import "@testing-library/jest-dom"
import { afterAll, afterEach, beforeAll, vi } from "vitest"
import { server } from "./mocks/server"
import ApiService from "../services/api"

// Mock main.tsx to avoid ReactDOM.createRoot side effect
vi.mock("../main", () => ({
    apiService: new ApiService("http://localhost:8000"),
    router: {},
}))

// jsdom has no matchMedia: emulate a desktop viewport so responsive
// components (useIsMobile) render their desktop layout by default.
const TEST_VIEWPORT_WIDTH = 1280
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => {
        const min = /min-width:\s*(\d+)px/.exec(query)
        const max = /max-width:\s*(\d+)px/.exec(query)
        const matches =
            (!min || TEST_VIEWPORT_WIDTH >= Number(min[1])) &&
            (!max || TEST_VIEWPORT_WIDTH <= Number(max[1]))
        return {
            matches,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }
    },
})

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
