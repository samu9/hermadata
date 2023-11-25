import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import ApiService from "./services/api.ts"
import { QueryClient, QueryClientProvider } from "react-query"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import { PrimeReactProvider } from "primereact/api"
import {
    BrowserRouter,
    RouterProvider,
    createBrowserRouter,
} from "react-router-dom"
import routes from "./router/routes.tsx"
export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL)
const queryClient = new QueryClient()
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
