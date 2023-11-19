import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import ApiService from "./services/api.ts"
import { QueryClient, QueryClientProvider } from "react-query"
import "primereact/resources/themes/lara-light-indigo/theme.css"
import { PrimeReactProvider } from "primereact/api"

export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL)
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <PrimeReactProvider value={{}}>
                <App />
            </PrimeReactProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
