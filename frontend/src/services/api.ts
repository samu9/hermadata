import axios, { AxiosInstance } from "axios"
import ApiEndpoints from "./apiEndpoints"
import {
    ComuneSchema,
    ProvinciaSchema,
    comuneSchema,
    provinciaSchema,
} from "../models/city.schema"
import { Race, raceSchema } from "../models/race.schema"
import {
    Animal,
    AnimalEdit,
    NewAnimalEntry,
    PaginatedAnimalSearchResult,
    paginatedAnimalSearchResultSchema,
} from "../models/animal.schema"
import { PaginationQuery } from "../models/pagination.schema"

class ApiService {
    inst: AxiosInstance

    constructor(baseURL: string) {
        this.inst = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    private async get<T>(
        endpoint: string,
        params: { [key: string]: any } = {}
    ): Promise<T> {
        const res = await this.inst.get<T>(endpoint, { params })
        return res.data
    }

    private async post<T>(endpoint: string, data: object): Promise<T> {
        const res = await this.inst.post<T>(endpoint, data)
        return res.data
    }

    createAnimalEntry(data: NewAnimalEntry): Promise<string> {
        return this.post<string>(ApiEndpoints.animal.create, data)
    }

    async getProvince(): Promise<ProvinciaSchema[]> {
        const data = await this.get<ProvinciaSchema[]>(
            ApiEndpoints.util.getProvince
        )
        const result = data.map((d) => provinciaSchema.parse(d))

        return result
    }

    async getComuni(provincia: string): Promise<ComuneSchema[]> {
        const data = await this.get<ComuneSchema[]>(
            ApiEndpoints.util.getComuni,
            { provincia }
        )
        const result = data.map((d) => comuneSchema.parse(d))

        return result
    }

    async getRaces(): Promise<Race[]> {
        const data = await this.get<Race[]>(ApiEndpoints.race.getAll)

        const result = data.map((d) => raceSchema.parse(d))

        return result
    }

    async getEntryTypes(): Promise<{ id: string; label: string }[]> {
        const data = await this.get<{ id: string; label: string }[]>(
            ApiEndpoints.util.getEntryTypes
        )

        return data
    }
    async newAnimal(data: NewAnimalEntry) {
        const result = await this.post(ApiEndpoints.animal.create, data)

        return result
    }

    async getAnimal(id: string): Promise<Animal> {
        const result = await this.get<Animal>(ApiEndpoints.animal.getById(id))

        return result
    }

    async searchAnimals(
        query: PaginationQuery
    ): Promise<PaginatedAnimalSearchResult> {
        const result = await this.get(ApiEndpoints.animal.search, query)

        return paginatedAnimalSearchResultSchema.parse(result)
    }

    async updateAnimal(id: string, data: AnimalEdit): Promise<boolean> {
        const result = await this.post<boolean>(
            ApiEndpoints.animal.update(id),
            data
        )

        return result
    }
}

export default ApiService
