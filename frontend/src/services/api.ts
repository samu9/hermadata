import axios, { AxiosError, AxiosInstance } from "axios"
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
    AnimalSearchQuery,
    AnimalSearchResult,
    ExitCheckResult,
    NewAnimalAdoption,
    NewAnimalEntry,
    PaginatedAnimalSearchResult,
    UpdateAnimalEntry,
    animalDocumentSchema,
    animalSchema,
    exitCheckResultSchema,
    paginatedAnimalSearchResultSchema,
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
import { IntUtilItem } from "../models/util.schema"
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

const DEFAULT_ERROR_MESSAGE = "Qualcosa è andato storto, riprova più tardi"

class ApiService {
    inst: AxiosInstance
    baseURL: string
    private toastRef: React.RefObject<any> | null = null // Reference to Toast

    constructor(baseURL: string) {
        this.baseURL = baseURL
        this.inst = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
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

    setToastRef(toastRef: React.RefObject<any>) {
        this.toastRef = toastRef
    }

    showSuccess(message: string, summary: string = "Successo") {
        if (this.toastRef?.current) {
            this.toastRef.current.show({
                severity: "success",
                summary: summary,
                detail: message,
                life: 3000,
            })
        }
    }

    showError(message: string | React.ReactNode, summary: string = "Errore") {
        if (this.toastRef?.current) {
            this.toastRef.current.show({
                severity: "error",
                summary: summary,
                detail: message,
                life: 5000,
            })
        }
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
        if (this.toastRef?.current) {
            this.toastRef.current.show({
                severity: "error", // Customize based on your Toast component
                summary: "Errore",
                detail: message,
                life: 5000, // Duration of the toast
            })
        }
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

    async moveAnimalToShelter(animalId: string, date: Date): Promise<number> {
        const result = await this.post<number>(
            ApiEndpoints.animal.moveToShelter(animalId),
            { date: date.toISOString() },
        )

        return result
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

    async uploadAnimalImage(animalId: string, file: File): Promise<number> {
        const formData = new FormData()
        formData.append("image", file)
        const result = this.post<number>(
            ApiEndpoints.animal.uploadImage(animalId),
            formData,
            {
                "Content-Type": "multipart/form-data",
            },
        )

        return result
    }

    async updateAnimalImage(
        animalId: string,
        data: { image_id: number },
    ): Promise<void> {
        const result = await this.put<void>(
            ApiEndpoints.animal.updateImage(animalId),
            data,
        )

        return result
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

    async openDocument(document_id: number) {
        window.open(new URL(ApiEndpoints.doc.open(document_id), this.baseURL))
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

    async checkAnimalExit(id: number): Promise<ExitCheckResult> {
        const result = await this.get<ExitCheckResult>(
            ApiEndpoints.animal.checkExit(id),
        )

        return exitCheckResultSchema.parse(result)
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

    async getUserActivities(): Promise<any[]> {
        const result = await this.get<any[]>(ApiEndpoints.user.activities)
        return result
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
    // Dashboard statistics methods
    async getDashboardStats(): Promise<{
        totalAnimals: number
        activeAnimals: number
        adoptedAnimals: number
        recentEntries: number
        recentExits: number
    }> {
        // Since there's no dedicated stats endpoint, we'll use search to get counts
        const activeAnimalsResult = await this.searchAnimals({
            from_index: 0,
            to_index: 1,
            present: true,
        })
        const totalAnimalsResult = await this.searchAnimals({
            from_index: 0,
            to_index: 1,
        })

        return {
            totalAnimals: totalAnimalsResult.total,
            activeAnimals: activeAnimalsResult.total,
            adoptedAnimals:
                totalAnimalsResult.total - activeAnimalsResult.total,
            recentEntries: 0, // Would need better date filtering
            recentExits: 0, // Would need exit endpoint to calculate properly
        }
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
