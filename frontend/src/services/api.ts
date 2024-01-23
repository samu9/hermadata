import axios, { AxiosInstance } from "axios"
import { Adopter, NewAdopter } from "../models/adopter.schema"
import {
    Animal,
    AnimalDocUpload,
    AnimalDocument,
    AnimalEdit,
    AnimalSearchQuery,
    NewAnimalAdoption,
    NewAnimalEntry,
    PaginatedAnimalSearchResult,
    animalDocumentSchema,
    animalSchema,
    paginatedAnimalSearchResultSchema,
} from "../models/animal.schema"
import { Breed, NewBreed } from "../models/breed.schema"
import {
    ComuneSchema,
    ProvinciaSchema,
    comuneSchema,
    provinciaSchema,
} from "../models/city.schema"
import { DocKind, NewDocKind } from "../models/docs.schema"
import { Race, raceSchema } from "../models/race.schema"
import { IntUtilItem } from "../models/util.schema"
import ApiEndpoints from "./apiEndpoints"

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
        })
    }

    private async get<T>(
        endpoint: string,
        params: { [key: string]: any } = {}
    ): Promise<T> {
        const res = await this.inst.get<T>(endpoint, { params })
        return res.data
    }

    private async post<T>(
        endpoint: string,
        data: object,
        headers = {}
    ): Promise<T> {
        const res = await this.inst.post<T>(endpoint, data, { headers })
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

        return animalSchema.parse(result)
    }

    async searchAnimals(
        query: AnimalSearchQuery
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
            data
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

    async newAnimalDocument(
        animal_id: number,
        data: AnimalDocUpload
    ): Promise<AnimalDocument> {
        const result = await this.post<AnimalDocument>(
            ApiEndpoints.animal.newDocument(animal_id),
            data
        )

        return animalDocumentSchema.parse(result)
    }

    async getAnimalDocuments(animal_id: number): Promise<AnimalDocument[]> {
        const result = await this.get<AnimalDocument[]>(
            ApiEndpoints.animal.documents(animal_id)
        )

        const parsed = result.map((r) => animalDocumentSchema.parse(r))
        console.log(parsed)
        return parsed
    }

    async openDocument(document_id: number) {
        window.open(new URL(ApiEndpoints.doc.open(document_id), this.baseURL))
    }

    async getAnimalSizes() {
        const data = await this.get<IntUtilItem[]>(
            ApiEndpoints.util.getAnimalSizes
        )
        return data
    }

    async getAnimalFurTypes() {
        const data = await this.get<IntUtilItem[]>(
            ApiEndpoints.util.getAnimalFurTypes
        )

        return data
    }

    async newAdopter(data: NewAdopter): Promise<Adopter> {
        const result = await this.post<Adopter>(
            ApiEndpoints.adopter.create,
            data
        )

        return result
    }

    async searchAdopter(fiscalCode: string): Promise<Adopter[]> {
        const result = await this.get<Adopter[]>(ApiEndpoints.adopter.search, {
            fiscal_code: fiscalCode,
        })

        return result
    }

    async newAnimalAdoption(data: NewAnimalAdoption) {
        const result = await this.post<number>(
            ApiEndpoints.adoption.create,
            data
        )
        return result
    }
}

export default ApiService
