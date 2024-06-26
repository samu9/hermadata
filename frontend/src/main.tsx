import "./index.css"
import "primereact/resources/themes/lara-light-indigo/theme.css"

import "primeicons/primeicons.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "react-query"
import ApiService from "./services/api.ts"

import { PrimeReactProvider } from "primereact/api"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import routes from "./router/routes.tsx"

// locale("it")

export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // default: true
        },
    },
})
export const router = createBrowserRouter(routes)

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <PrimeReactProvider value={{}}>
                <RouterProvider router={router} />
            </PrimeReactProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
