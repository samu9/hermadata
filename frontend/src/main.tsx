// IMPORTANT: do not change the order of these imports
import "./index.css"
import "primereact/resources/primereact.css"
import "primereact/resources/themes/lara-light-teal/theme.css"

import "primeicons/primeicons.css"

import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "react-query"
import ApiService from "./services/api.ts"

import { PrimeReactProvider, addLocale, locale } from "primereact/api"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Loader from "./components/Loader.tsx"
import { LoaderProvider } from "./contexts/Loader.tsx"
import { AuthProvider } from "./contexts/AuthContext.tsx"
import routes from "./router/routes.tsx"

addLocale("it", {
    apply: "Applica",
    clear: "Cancella",
    accept: "Sì",
    reject: "No",
    choose: "Scegli",
    upload: "Carica",
    cancel: "Annulla",
    close: "Chiudi",
    contains: "Contiene",
    notContains: "Non contiene",
    startsWith: "Inizia con",
    endsWith: "Finisce con",
    equals: "Uguale a",
    notEquals: "Diverso da",
    noFilter: "Nessun filtro",
    lt: "Minore di",
    lte: "Minore o uguale a",
    gt: "Maggiore di",
    gte: "Maggiore o uguale a",
    dateIs: "Data uguale a",
    dateIsNot: "Data diversa da",
    dateBefore: "Data prima di",
    dateAfter: "Data dopo",
    emptyMessage: "Nessun risultato trovato",
    emptyFilterMessage: "Nessun risultato trovato",
    matchAll: "Tutti i criteri",
    matchAny: "Almeno un criterio",
    addRule: "Aggiungi regola",
    removeRule: "Rimuovi regola",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB"],
    dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
    dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
    dayNamesMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
    monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
    monthNamesShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
    today: "Oggi",
    weekHeader: "Sett",
    firstDayOfWeek: 1,
    dateFormat: "dd/mm/yy",
    weak: "Debole",
    medium: "Medio",
    strong: "Forte",
    passwordPrompt: "Inserisci una password",
    aria: {
        trueLabel: "Vero",
        falseLabel: "Falso",
        nullLabel: "Non selezionato",
        pageLabel: "Pagina {page}",
        firstPageLabel: "Prima pagina",
        lastPageLabel: "Ultima pagina",
        nextPageLabel: "Pagina successiva",
        previousPageLabel: "Pagina precedente",
    },
})
locale("it")

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
                <AuthProvider>
                    <LoaderProvider>
                        <RouterProvider router={router} />
                        <Loader />
                    </LoaderProvider>
                </AuthProvider>
            </PrimeReactProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
