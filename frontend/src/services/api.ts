import axios, { AxiosError, AxiosInstance } from "axios"
import { z } from "zod"
import { toastService } from "./toast"
import { dateOnly } from "../models/validators"
import {
    ActivityFilterQuery,
    PaginatedActivityResult,
    paginatedActivitySchema,
} from "../models/activity.schema"
import {
    Adopter,
    adopterSchema,
    AdopterSearch,
    NewAdopter,
    PaginatedAdopterSearchResult,
} from "../models/adopter.schema"
import {
    Animal,
    AnimalCompleteEntry,
    AnimalDaysRequestSchema as AnimalDaysRequest,
    AnimalDocUpload,
    AnimalDocument,
    AnimalEdit,
    AnimalEntriesReportSchema,
    AnimalEntry,
    AnimalExit,
    AnimalExitsReportSchema,
    AnimalImage,
    AnimalSearchQuery,
    AnimalSearchResult,
    ExitCheckResult,
    NewAnimalAdoption,
    NewAnimalEntry,
    PaginatedAnimalSearchResult,
    UpdateAnimalEntry,
    animalDocumentSchema,
    animalImageSchema,
    animalSchema,
    exitCheckResultSchema,
    paginatedAnimalSearchResultSchema,
    AnimalLog,
    animalLogSchema,
    NewAnimalLog,
} from "../models/animal.schema"
import { ApiError } from "../models/api.schema"
import { Breed, NewBreed } from "../models/breed.schema"
import {
    ComuneSchema,
    ProvinciaSchema,
    comuneSchema,
    provinciaSchema,
} from "../models/city.schema"
import { DocKind, NewDocKind } from "../models/docs.schema"
import { Race, raceSchema } from "../models/race.schema"
import { Role, roleSchema } from "../models/role.schema"
import { Permission, permissionSchema } from "../models/permission.schema"
import {
    AnimalEventType,
    IntUtilItem,
    animalEventTypeSchema,
} from "../models/util.schema"
import ApiEndpoints from "./apiEndpoints"
import {
    NewVet,
    PaginatedVetSearchResult,
    Vet,
    VetSearch,
} from "../models/vet.schema"
import {
    Login,
    LoginResponse,
    ManagementUser,
    UpdateUser,
} from "../models/user.schema"
import { PaginationQuery } from "../models/pagination.schema"
import { Structure } from "../models/structure.schema"
import { NewTherapy, Therapy, TherapyReminder } from "../models/therapy.schema"

const DEFAULT_ERROR_MESSAGE = "Qualcosa è andato storto, riprova più tardi"

class ApiService {
    inst: AxiosInstance
    baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
        this.inst = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            paramsSerializer: (params) => {
                const searchParams = new URLSearchParams()
                for (const [key, value] of Object.entries(params)) {
                    if (value === null || value === undefined) continue
                    if (Array.isArray(value)) {
                        value.forEach((v) => searchParams.append(key, String(v)))
                    } else {
                        searchParams.append(key, String(value))
                    }
                }
                return searchParams.toString()
            },
        })

        // Request interceptor to add auth token
        this.inst.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("accessToken")
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error),
        )

        this.inst.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // Handle token expiration
                if (error.response?.status === 401) {
                    this.logout()
                    // Optionally redirect to login page
                    window.location.href = "/login"
                }
                this.handleError(error)
                return Promise.reject(error)
            },
        )
    }

    private handleError(error: AxiosError): void {
        let message = DEFAULT_ERROR_MESSAGE

        if (error.response) {
            const { data } = error.response
            const errorMessage = data as { detail: string }
            if (errorMessage.detail) {
                message = errorMessage.detail
            }
        }
        toastService.showError(message)
    }

    private async get<T>(
        endpoint: string,
        params: { [key: string]: any } = {},
    ): Promise<T> {
        const res = await this.inst.get<T>(endpoint, { params })
        return res.data
    }

    private async post<T>(
        endpoint: string,
        data: object,
        headers = {},
    ): Promise<T> {
        const res = await this.inst.post<T>(endpoint, data, { headers })
        return res.data
    }

    private async put<T>(
        endpoint: string,
        data: object,
        headers = {},
    ): Promise<T> {
        const res = await this.inst.put<T>(endpoint, data, { headers })
        return res.data
    }

    private async delete<T = void>(endpoint: string): Promise<T> {
        const res = await this.inst.delete<T>(endpoint)
        return res.data
    }

    createAnimal(data: NewAnimalEntry): Promise<string> {
        return this.post<string>(ApiEndpoints.animal.create, data)
    }

    addAnimalEntry(animalId: string, data: NewAnimalEntry): Promise<string> {
        return this.post<string>(ApiEndpoints.animal.addEntry(animalId), data)
    }
    async getProvince(): Promise<ProvinciaSchema[]> {
        const data = await this.get<ProvinciaSchema[]>(
            ApiEndpoints.util.getProvince,
        )
        const result = data.map((d) => provinciaSchema.parse(d))

        return result
    }

    async getComuni(provincia: string): Promise<ComuneSchema[]> {
        const data = await this.get<ComuneSchema[]>(
            ApiEndpoints.util.getComuni,
            { provincia },
        )
        const result = data.map((d) => comuneSchema.parse(d))

        return result
    }

    async getComune(code: string): Promise<ComuneSchema | null> {
        const data = await this.get<ComuneSchema>(
            ApiEndpoints.util.getComune(code),
        )
        if (!data) return null
        return comuneSchema.parse(data)
    }

    async getRaces(): Promise<Race[]> {
        const data = await this.get<Race[]>(ApiEndpoints.race.getAll)

        const result = data.map((d) => raceSchema.parse(d))

        return result
    }

    async getEntryTypes(): Promise<
        { id: string; label: string; healthcare_stage: boolean }[]
    > {
        const data = await this.get<
            { id: string; label: string; healthcare_stage: boolean }[]
        >(ApiEndpoints.util.getEntryTypes)

        return data
    }

    async getExitTypes(): Promise<{ id: string; label: string }[]> {
        const data = await this.get<{ id: string; label: string }[]>(
            ApiEndpoints.util.getExitTypes,
        )

        return data
    }
    async newAnimal(data: NewAnimalEntry) {
        const result = await this.post(ApiEndpoints.animal.create, data)

        return result
    }

    async getAnimal(id: string): Promise<Animal> {
        const result = await this.get<Animal>(ApiEndpoints.animal.getById(id))

        return animalSchema.parse(result)
    }

    async searchAnimals(
        query: AnimalSearchQuery,
    ): Promise<PaginatedAnimalSearchResult> {
        const result = await this.get(ApiEndpoints.animal.search, query)

        return paginatedAnimalSearchResultSchema.parse(result)
    }

    async updateAnimal(
        id: string,
        data: AnimalEdit,
    ): Promise<boolean | ApiError> {
        const result = await this.post<boolean | ApiError>(
            ApiEndpoints.animal.update(id),
            data,
        )

        return result
    }

    async getAnimalLogs(id: string | number): Promise<AnimalLog[]> {
        const result = await this.get<AnimalLog[]>(
            ApiEndpoints.animal.getLogs(id.toString()),
        )

        return result.map((d) => animalLogSchema.parse(d))
    }

    async addAnimalLog(
        id: string | number,
        data: NewAnimalLog,
    ): Promise<AnimalLog> {
        const result = await this.post<AnimalLog>(
            ApiEndpoints.animal.getLogs(id.toString()),
            data,
        )
        return animalLogSchema.parse(result)
    }

    async deleteAnimal(id: number): Promise<void> {
        await this.delete(ApiEndpoints.animal.delete(id))
    }

    async completeAnimalEntry(
        id: string,
        data: AnimalCompleteEntry,
    ): Promise<boolean> {
        const result = await this.post<boolean>(
            ApiEndpoints.animal.completeEntry(id),
            data,
        )

        return result
    }

    async updateAnimalEntry(
        animalId: string,
        entryId: number,
        data: UpdateAnimalEntry,
    ): Promise<{ message: string; updated_rows: number }> {
        const result = await this.put<{
            message: string
            updated_rows: number
        }>(ApiEndpoints.animal.updateEntry(animalId, entryId), data)

        return result
    }

    async getAnimalEntries(animalId: string): Promise<AnimalEntry[]> {
        const result = await this.get<AnimalEntry[]>(
            ApiEndpoints.animal.getEntries(animalId),
        )

        return result
    }

    async moveAnimalToShelter(animalId: string, date: Date, structureId: number): Promise<void> {
        await this.post<void>(
            ApiEndpoints.animal.moveToShelter(animalId),
            { date: dateOnly.parse(date), structure_id: structureId },
        )
    }

    async addBreed(data: NewBreed): Promise<Breed> {
        const result = await this.post<Breed>(ApiEndpoints.breed.create, data)

        return result
    }

    async getBreeds(race_id: string): Promise<Breed[]> {
        const result = await this.get<Breed[]>(ApiEndpoints.breed.getAll, {
            race_id,
        })

        return result
    }

    async getAllDocKinds(): Promise<DocKind[]> {
        const result = await this.get<DocKind[]>(ApiEndpoints.doc.getAllKinds)

        return result
    }

    async addNewDocKind(data: NewDocKind): Promise<DocKind> {
        const result = await this.post<DocKind>(
            ApiEndpoints.doc.createKind,
            data,
        )

        return result
    }

    async uploadDoc(file: File): Promise<number> {
        const formData = new FormData()
        formData.append("doc", file)
        const result = this.post<number>(ApiEndpoints.doc.upload, formData, {
            "Content-Type": "multipart/form-data",
        })

        return result
    }

    async uploadAnimalImage(animalId: number, file: File): Promise<AnimalImage> {
        const formData = new FormData()
        formData.append("image", file)
        const result = await this.post<AnimalImage>(
            ApiEndpoints.animal.uploadImage(animalId),
            formData,
            { "Content-Type": "multipart/form-data" },
        )
        return animalImageSchema.parse(result)
    }

    async listAnimalImages(animalId: number): Promise<AnimalImage[]> {
        const result = await this.get<AnimalImage[]>(
            ApiEndpoints.animal.listImages(animalId),
        )
        return z.array(animalImageSchema).parse(result)
    }

    getAnimalImageUrl(animalId: number, imageId: number): string {
        return `${this.baseURL}${ApiEndpoints.animal.serveImage(animalId, imageId)}`
    }

    async setProfileImage(animalId: number, imageId: number): Promise<void> {
        await this.put<void>(
            ApiEndpoints.animal.setProfileImage(animalId, imageId),
            {},
        )
    }

    async deleteAnimalImage(animalId: number, imageId: number): Promise<void> {
        await this.inst.delete(
            ApiEndpoints.animal.deleteImage(animalId, imageId),
        )
    }

    async getAdopter(id: number): Promise<Adopter> {
        const result = await this.get<Adopter>(ApiEndpoints.adopter.getById(id))
        return adopterSchema.parse(result)
    }

    async newAnimalDocument(
        animal_id: number,
        data: AnimalDocUpload,
    ): Promise<AnimalDocument> {
        const result = await this.post<AnimalDocument>(
            ApiEndpoints.animal.newDocument(animal_id),
            data,
        )

        return animalDocumentSchema.parse(result)
    }

    async getAnimalDocuments(animal_id: number): Promise<AnimalDocument[]> {
        const result = await this.get<AnimalDocument[]>(
            ApiEndpoints.animal.documents(animal_id),
        )

        const parsed = result.map((r) => animalDocumentSchema.parse(r))
        return parsed
    }

    async deleteAnimalDocument(
        animalId: number,
        documentId: number,
        permanent = false,
    ): Promise<void> {
        await this.inst.delete(
            ApiEndpoints.animal.deleteDocument(animalId, documentId),
            { params: { permanent } },
        )
    }

    async openDocument(document_id: number): Promise<void> {
        const result = await this.get<{ url: string }>(
            ApiEndpoints.doc.open(document_id),
        )
        window.open(result.url)
    }

    async getAnimalSizes() {
        const data = await this.get<IntUtilItem[]>(
            ApiEndpoints.util.getAnimalSizes,
        )
        return data
    }

    async getAnimalFurTypes() {
        const data = await this.get<IntUtilItem[]>(
            ApiEndpoints.util.getAnimalFurTypes,
        )

        return data
    }

    async getAnimalFurColors() {
        const data = await this.get<IntUtilItem[]>(ApiEndpoints.util.furColor)

        return data
    }

    async getAnimalEventTypes(): Promise<AnimalEventType[]> {
        const data = await this.get<AnimalEventType[]>(ApiEndpoints.util.events)

        return data.map((d) => animalEventTypeSchema.parse(d))
    }

    async addAnimalFurColor(data: { name: string }): Promise<IntUtilItem> {
        const result = await this.post<IntUtilItem>(
            ApiEndpoints.util.furColor,
            data,
        )

        return result
    }

    async newAdopter(data: NewAdopter): Promise<Adopter> {
        const result = await this.post<Adopter>(
            ApiEndpoints.adopter.create,
            data,
        )

        return result
    }

    async searchAdopter(
        query: AdopterSearch,
    ): Promise<PaginatedAdopterSearchResult> {
        const result = await this.get<PaginatedAdopterSearchResult>(
            ApiEndpoints.adopter.search,
            query,
        )

        return result
    }

    async newAnimalAdoption(data: NewAnimalAdoption) {
        const result = await this.post<number>(
            ApiEndpoints.adoption.create,
            data,
        )
        return result
    }

    async animalExit(data: AnimalExit) {
        const result = await this.post<void>(
            ApiEndpoints.animal.exit(data.animal_id),
            data,
        )

        return result
    }

    async deleteAnimalExit(id: number): Promise<void> {
        await this.delete(ApiEndpoints.animal.exit(id))
    }

    async checkAnimalExit(id: number): Promise<ExitCheckResult> {
        const result = await this.get<ExitCheckResult>(
            ApiEndpoints.animal.checkExit(id),
        )

        return exitCheckResultSchema.parse(result)
    }

    async confirmTemporaryAdoption(
        id: number,
        confirmationDate: Date,
    ): Promise<void> {
        await this.post<void>(
            ApiEndpoints.animal.confirmTemporaryAdoption(id),
            { confirmation_date: confirmationDate.toISOString().split("T")[0] },
        )
    }

    async undoTemporaryAdoption(id: number): Promise<void> {
        await this.post<void>(ApiEndpoints.animal.undoTemporaryAdoption(id), {})
    }

    async animalDaysReport(data: AnimalDaysRequest) {
        const result = await this.inst.get(ApiEndpoints.animal.daysReport, {
            params: data,
            responseType: "blob",
        })
        console.log(result.headers)
        const filename = result.headers["x-filename"].toString()
        const filetype = result.headers["content-type"]?.toString()
        const url = window.URL.createObjectURL(
            new Blob([result.data], { type: filetype }),
        )
        return { url, filename }
    }

    async animalEntriesReport(data: AnimalEntriesReportSchema) {
        const result = await this.inst.get(ApiEndpoints.animal.entriesReport, {
            params: data,
            responseType: "blob",
        })
        console.log(result.headers)
        const filename = result.headers["x-filename"].toString()
        const filetype = result.headers["content-type"]?.toString()
        const url = window.URL.createObjectURL(
            new Blob([result.data], { type: filetype }),
        )
        return { url, filename }
    }

    async animalExitsReport(data: AnimalExitsReportSchema) {
        const result = await this.inst.get(ApiEndpoints.animal.exitsReport, {
            params: data,
            responseType: "blob",
        })
        console.log(result.headers)
        const filename = result.headers["x-filename"].toString()
        const filetype = result.headers["content-type"]?.toString()
        const url = window.URL.createObjectURL(
            new Blob([result.data], { type: filetype }),
        )
        return { url, filename }
    }

    async animalSearchReport(data: AnimalSearchQuery) {
        const result = await this.inst.get(ApiEndpoints.animal.searchReport, {
            params: data,
            responseType: "blob",
        })
        const filename = result.headers["x-filename"].toString()
        const filetype = result.headers["content-type"]?.toString()
        const url = window.URL.createObjectURL(
            new Blob([result.data], { type: filetype }),
        )
        return { url, filename }
    }

    async searchVet(query: VetSearch): Promise<PaginatedVetSearchResult> {
        const result = await this.get<PaginatedVetSearchResult>(
            ApiEndpoints.vet.search,
            query,
        )

        return result
    }

    async newVet(data: NewVet): Promise<Vet> {
        const result = await this.post<Vet>(ApiEndpoints.vet.create, data)

        return result
    }

    // Authentication methods
    async login(data: Login): Promise<LoginResponse> {
        const result = await this.post<LoginResponse>(
            ApiEndpoints.user.login,
            data,
            {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

        localStorage.setItem("accessToken", result.access_token)
        // Store token timestamp for expiration checking
        localStorage.setItem("tokenTimestamp", Date.now().toString())

        return result
    }

    logout(): void {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("tokenTimestamp")
    }

    // User Management methods
    async getAllUsers(
        query?: PaginationQuery,
    ): Promise<{ total: number; items: ManagementUser[] }> {
        const result = await this.get<{
            total: number
            items: ManagementUser[]
        }>(ApiEndpoints.user.getAll, query)
        return result
    }

    async createUser(data: any): Promise<any> {
        const result = await this.post<any>(ApiEndpoints.user.create, data)
        return result
    }

    async updateUser(userId: number, data: UpdateUser): Promise<any> {
        const result = await this.put<any>(
            ApiEndpoints.user.update(userId),
            data,
        )
        return result
    }

    async deleteUser(userId: number): Promise<void> {
        await this.delete(ApiEndpoints.user.delete(userId))
    }

    async changeUserPassword(
        userId: number,
        currentPassword: string,
        newPassword: string,
    ): Promise<void> {
        await this.post(ApiEndpoints.user.changePassword(userId), {
            current_password: currentPassword,
            new_password: newPassword,
        })
    }

    async changeUserPasswordAsAdmin(
        userId: number,
        newPassword: string,
    ): Promise<void> {
        await this.post(ApiEndpoints.user.changePassword(userId), {
            new_password: newPassword,
        })
    }

    async getUserActivities(
        query: ActivityFilterQuery,
    ): Promise<PaginatedActivityResult> {
        const result = await this.get<PaginatedActivityResult>(
            ApiEndpoints.user.activity,
            query,
        )
        return paginatedActivitySchema.parse(result)
    }

    async getCurrentUser(): Promise<ManagementUser> {
        const result = await this.get<ManagementUser>(
            ApiEndpoints.user.getCurrentUser,
        )
        return result
    }

    async getRoles(): Promise<Role[]> {
        const result = await this.get<Role[]>(ApiEndpoints.user.roles)
        return result.map((role) => roleSchema.parse(role))
    }

    async getPermissions(): Promise<Permission[]> {
        const result = await this.get<Permission[]>(
            ApiEndpoints.user.permissions,
        )
        return result.map((permission) => permissionSchema.parse(permission))
    }
    async getAnimalStats(params: {
        from_date: string
        to_date: string
        structure_ids?: number[]
    }): Promise<{
        total_animals: number
        present_animals: number
        adopted_animals: number
        entered_animals: number
    }> {
        const searchParams = new URLSearchParams({
            from_date: params.from_date,
            to_date: params.to_date,
        })
        if (params.structure_ids?.length) {
            params.structure_ids.forEach((id) =>
                searchParams.append("structure_ids", String(id)),
            )
        }
        const response = await this.inst.get(
            `${ApiEndpoints.animal.stats}?${searchParams.toString()}`,
        )
        return response.data
    }

    async getRecentAnimals(limit: number = 5): Promise<AnimalSearchResult[]> {
        const result = await this.searchAnimals({
            from_index: 0,
            to_index: limit,
            sort_field: "entry_date",
            sort_order: -1, // descending
        })
        return result.items
    }

    async getStructures(): Promise<Structure[]> {
        const response = await this.inst.get<Structure[]>(
            ApiEndpoints.structure.getAll,
        )
        return response.data
    }

    async moveAnimalToStructure(
        animalId: number,
        structureId: number,
    ): Promise<boolean> {
        const response = await this.inst.post<boolean>(
            ApiEndpoints.structure.moveAnimal(animalId),
            { structure_id: structureId },
        )
        return response.data
    }

    getTherapies(animalId: number): Promise<Therapy[]> {
        return this.get<Therapy[]>(ApiEndpoints.therapy.list(animalId))
    }

    getTherapyReminders(
        structureIds: number[],
        days = 30,
    ): Promise<TherapyReminder[]> {
        return this.get<TherapyReminder[]>(ApiEndpoints.therapy.reminders, {
            structure_ids: structureIds,
            days,
        })
    }

    createTherapy(animalId: number, data: NewTherapy): Promise<Therapy> {
        return this.post<Therapy>(ApiEndpoints.therapy.create(animalId), data)
    }

    endTherapy(animalId: number, therapyId: number): Promise<Therapy> {
        return this.post<Therapy>(ApiEndpoints.therapy.end(animalId, therapyId), {})
    }

    deleteTherapy(animalId: number, therapyId: number): Promise<void> {
        return this.delete<void>(ApiEndpoints.therapy.delete(animalId, therapyId))
    }

    attachTherapyDocument(
        animalId: number,
        therapyId: number,
        docType: "prescription" | "transport",
        documentId: number,
    ): Promise<Therapy> {
        return this.post<Therapy>(
            ApiEndpoints.therapy.attachDocument(animalId, therapyId, docType),
            { document_id: documentId },
        )
    }


    isAuthenticated(): boolean {
        const token = localStorage.getItem("accessToken")
        const timestamp = localStorage.getItem("tokenTimestamp")

        if (!token || !timestamp) {
            return false
        }

        // Check if token is older than 24 hours (adjust as needed)
        const tokenAge = Date.now() - parseInt(timestamp)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        if (tokenAge > maxAge) {
            this.logout()
            return false
        }

        return true
    }

    getAccessToken(): string | null {
        return this.isAuthenticated()
            ? localStorage.getItem("accessToken")
            : null
    }
}

export default ApiService
