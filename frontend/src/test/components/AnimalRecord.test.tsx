import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from "react-query"
import { PrimeReactProvider } from "primereact/api"
import { AuthProvider } from "../../contexts/AuthContext"
import { LoaderProvider } from "../../contexts/Loader"
import { ToolbarProvider } from "../../contexts/Toolbar"
import Toolbar from "../../components/Toolbar"
import AnimalRecord from "../../components/animal/AnimalRecord"
import { Animal } from "../../models/animal.schema"
import {
    setupAuthenticatedUser,
    clearAuthState,
    createTestQueryClient,
} from "../utils"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

const BASE_URL = "http://localhost:8000"

const baseAnimal: Animal = {
    code: "C0012345678AB",
    name: "Fido",
    race_id: "C",
    breed_id: null,
    sterilized: false,
    entry_date: new Date("2024-01-15"),
    entry_type: "R",
    exit_date: null,
    exit_type: null,
    birth_date: new Date("2020-06-15"),
    stage: null,
    adoptability_index: 0,
    chip_code: null,
    chip_code_set: false,
    profile_image_id: null,
    img_path: null,
    sex: 0,
    notes: null,
    fur: 1,
    size: 2,
    color: 1,
    in_shelter_from: null,
    healthcare_stage: false,
    without_chip: false,
    structure_id: 1,
    deleted_at: null,
}

function renderAnimalRecord(animal: Animal) {
    const queryClient = createTestQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <PrimeReactProvider value={{}}>
                <MemoryRouter initialEntries={["/animal/1/overview"]}>
                    <AuthProvider>
                        <LoaderProvider>
                            <ToolbarProvider>
                                <Routes>
                                    <Route
                                        path="/animal/:id/*"
                                        element={
                                            <>
                                                <AnimalRecord data={animal} />
                                                <Toolbar />
                                            </>
                                        }
                                    />
                                </Routes>
                            </ToolbarProvider>
                        </LoaderProvider>
                    </AuthProvider>
                </MemoryRouter>
            </PrimeReactProvider>
        </QueryClientProvider>
    )
}

describe("AnimalRecord restore deleted animal", () => {
    afterEach(() => {
        clearAuthState()
        vi.restoreAllMocks()
    })

    describe("as superuser", () => {
        beforeEach(() => {
            setupAuthenticatedUser(true, ["EAN", "BPA", "BDA"])
        })

        it("shows 'Ripristina animale' in toolbar when animal is deleted", async () => {
            renderAnimalRecord({
                ...baseAnimal,
                deleted_at: new Date("2026-01-10T10:00:00"),
            })

            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: /Ripristina animale/i })
                ).toBeInTheDocument()
            })
            expect(
                screen.queryByRole("button", { name: /Elimina animale/i })
            ).not.toBeInTheDocument()
        })

        it("calls restore endpoint when confirming dialog", async () => {
            let restoredId: string | undefined
            server.use(
                http.post(`${BASE_URL}/animal/:id/restore`, ({ params }) => {
                    restoredId = String(params.id)
                    return new HttpResponse(null, { status: 204 })
                })
            )

            renderAnimalRecord({
                ...baseAnimal,
                deleted_at: new Date("2026-01-10T10:00:00"),
            })

            const restoreBtn = await screen.findByRole("button", {
                name: /Ripristina animale/i,
            })
            await userEvent.click(restoreBtn)

            expect(
                await screen.findByText(/Ripristinare l'animale\?/i)
            ).toBeInTheDocument()

            const confirmBtn = screen.getByRole("button", {
                name: /^Ripristina$/i,
            })
            await userEvent.click(confirmBtn)

            await waitFor(() => {
                expect(restoredId).toBe("1")
            })
        })
    })

    describe("as non-superuser", () => {
        beforeEach(() => {
            setupAuthenticatedUser(false, ["EAN", "BPA", "BDA"])
        })

        it("does not show 'Ripristina animale' button", async () => {
            renderAnimalRecord({
                ...baseAnimal,
                deleted_at: new Date("2026-01-10T10:00:00"),
            })

            await waitFor(() => {
                expect(
                    screen.getByText(/La scheda è in sola lettura/i)
                ).toBeInTheDocument()
            })
            expect(
                screen.queryByRole("button", { name: /Ripristina animale/i })
            ).not.toBeInTheDocument()
        })
    })
})
