import axios, { AxiosInstance } from "axios"
import { NewAnimalSchema } from "../models/new-animal.schema"
import ApiEndpoints from "./apiEndpoints"
import {
    ComuneSchema,
    ProvinciaSchema,
    comuneSchema,
    provinciaSchema,
} from "../models/city.schema"
import { RaceSchema, raceSchema } from "../models/race.schema"

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

    createAnimal(data: NewAnimalSchema) {
        return this.post(ApiEndpoints.animal.create, data)
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

    async getRaces(): Promise<RaceSchema[]> {
        const data = await this.get<RaceSchema[]>(ApiEndpoints.race.getAll)

        const result = data.map((d) => raceSchema.parse(d))

        return result
    }

    async newAnimal(data: NewAnimalSchema) {
        const result = await this.post(ApiEndpoints.animal.create, data)

        return result
    }
}

export default ApiService
