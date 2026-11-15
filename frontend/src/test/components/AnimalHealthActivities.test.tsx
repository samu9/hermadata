import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, screen, waitFor, render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "react-query"
import { ConfirmDialog } from "primereact/confirmdialog"
import { http, HttpResponse } from "msw"
import { server } from "../mocks/server"
import AnimalHealthActivities from "../../components/animal/AnimalHealthActivities"
import { HealthActivity } from "../../models/healthActivity.schema"

const auth = vi.hoisted(() => ({ permissions: ["BHA", "CHA", "EHA", "DHA"] }))
vi.mock("../../contexts/AuthContext", () => ({
    useAuth: () => ({ can: (permission: string) => auth.permissions.includes(permission) }),
}))

let rows: HealthActivity[]
let searches: URLSearchParams[]
const endpoint = "http://localhost:8000/animal/1/health-activities"

function renderRegister() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(<QueryClientProvider client={client}>
        <ConfirmDialog />
        <AnimalHealthActivities animalId={1} />
    </QueryClientProvider>)
}

beforeEach(() => {
    auth.permissions = ["BHA", "CHA", "EHA", "DHA"]
    rows = [{ id: 1, animal_id: 1, activity_date: "2026-01-15", description: "Vaccinazione" }]
    searches = []
    server.use(
        http.get(endpoint, ({ request }) => {
            const params = new URL(request.url).searchParams
            searches.push(params)
            return HttpResponse.json(rows.filter((row) =>
                (!params.get("description") || row.description.toLowerCase().includes(params.get("description")!.toLowerCase()))
                && (!params.get("from_date") || row.activity_date >= params.get("from_date")!)
                && (!params.get("to_date") || row.activity_date <= params.get("to_date")!)))
        }),
        http.post(endpoint, async ({ request }) => {
            const row = { ...await request.json() as object, id: 2, animal_id: 1 } as HealthActivity
            rows.push(row)
            return HttpResponse.json(row, { status: 201 })
        }),
        http.put(`${endpoint}/:id`, async ({ request, params }) => {
            const row = { ...await request.json() as object, id: Number(params.id), animal_id: 1 } as HealthActivity
            rows = rows.map((old) => old.id === row.id ? row : old)
            return HttpResponse.json(row)
        }),
        http.delete(`${endpoint}/:id`, ({ params }) => {
            rows = rows.filter((row) => row.id !== Number(params.id))
            return new HttpResponse(null, { status: 204 })
        }),
    )
})

describe("Animal health activity register", () => {
    it("shows dates, searches by date and description, and resets", async () => {
        renderRegister()
        expect(await screen.findByText("Vaccinazione")).toBeInTheDocument()
        expect(screen.getByText("15/01/2026")).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText("Descrizione"), { target: { value: "controllo" } })
        fireEvent.change(screen.getByLabelText("Dal"), { target: { value: "2026-01-01" } })
        fireEvent.change(screen.getByLabelText("Al"), { target: { value: "2026-01-31" } })
        fireEvent.click(screen.getByRole("button", { name: "Cerca" }))
        expect(await screen.findByText("Nessuna attività corrisponde ai filtri")).toBeInTheDocument()
        expect(searches[searches.length - 1].get("from_date")).toBe("2026-01-01")
        expect(searches[searches.length - 1].get("to_date")).toBe("2026-01-31")
        fireEvent.click(screen.getByRole("button", { name: "Reimposta" }))
        expect(await screen.findByText("Vaccinazione")).toBeInTheDocument()
    })

    it("creates and edits activities and refreshes the table", async () => {
        renderRegister()
        await screen.findByText("Vaccinazione")
        fireEvent.click(screen.getByRole("button", { name: "Nuova attività" }))
        fireEvent.change(screen.getByLabelText("Data", { exact: true }), { target: { value: "2026-02-01" } })
        fireEvent.change(screen.getByLabelText("Descrizione", { selector: "textarea" }), { target: { value: " Controllo medico " } })
        fireEvent.click(screen.getByRole("button", { name: "Salva" }))
        expect(await screen.findByText("Controllo medico")).toBeInTheDocument()
        expect(rows[1].description).toBe("Controllo medico")
        fireEvent.click(screen.getAllByRole("button", { name: "Modifica attività" })[0])
        fireEvent.change(screen.getByLabelText("Descrizione", { selector: "textarea" }), { target: { value: "Vaccino aggiornato" } })
        fireEvent.click(screen.getByRole("button", { name: "Salva" }))
        expect(await screen.findByText("Vaccino aggiornato")).toBeInTheDocument()
    })

    it("confirms deletion before removing an activity", async () => {
        renderRegister()
        await screen.findByText("Vaccinazione")
        fireEvent.click(screen.getByRole("button", { name: "Elimina attività" }))
        expect(rows).toHaveLength(1)
        fireEvent.click(await screen.findByRole("button", { name: "Elimina" }))
        expect(await screen.findByText("Nessuna attività sanitaria registrata")).toBeInTheDocument()
        expect(rows).toHaveLength(0)
    })

    it("hides the register and skips fetching without browse permission", async () => {
        auth.permissions = ["CHA", "EHA", "DHA"]
        renderRegister()
        expect(screen.queryByText("Registro attività sanitarie")).not.toBeInTheDocument()
        await waitFor(() => expect(searches).toHaveLength(0))
    })

    it("shows a read-only register with browse permission alone", async () => {
        auth.permissions = ["BHA"]
        renderRegister()
        await screen.findByText("Vaccinazione")
        expect(screen.queryByRole("button", { name: "Nuova attività" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Modifica attività" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Elimina attività" })).not.toBeInTheDocument()
    })

    it("blocks reversed date ranges", async () => {
        renderRegister()
        await screen.findByText("Vaccinazione")
        fireEvent.change(screen.getByLabelText("Dal"), { target: { value: "2026-02-01" } })
        fireEvent.change(screen.getByLabelText("Al"), { target: { value: "2026-01-01" } })
        expect(screen.getByRole("button", { name: "Cerca" })).toBeDisabled()
        expect(screen.getByRole("alert")).toHaveTextContent("La data iniziale")
    })
})
