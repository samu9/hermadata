import axios, { AxiosInstance } from "axios"
import {
    Adopter,
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
    AnimalExit,
    AnimalExitsReportSchema,
    AnimalSearchQuery,
    NewAnimalAdoption,
    NewAnimalEntry,
    PaginatedAnimalSearchResult,
    animalDocumentSchema,
    animalSchema,
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
import { IntUtilItem } from "../models/util.schema"
import ApiEndpoints from "./apiEndpoints"
import {
    NewVet,
    PaginatedVetSearchResult,
    Vet,
    VetSearch,
} from "../models/vet.schema"

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

    createAnimal(data: NewAnimalEntry): Promise<string> {
        return this.post<string>(ApiEndpoints.animal.create, data)
    }

    addAnimalEntry(animalId: string, data: NewAnimalEntry): Promise<string> {
        return this.post<string>(ApiEndpoints.animal.addEntry(animalId), data)
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

    async getExitTypes(): Promise<{ id: string; label: string }[]> {
        const data = await this.get<{ id: string; label: string }[]>(
            ApiEndpoints.util.getExitTypes
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

    async updateAnimal(
        id: string,
        data: AnimalEdit
    ): Promise<boolean | ApiError> {
        const result = await this.post<boolean | ApiError>(
            ApiEndpoints.animal.update(id),
            data
        )

        return result
    }

    async completeAnimalEntry(
        id: string,
        data: AnimalCompleteEntry
    ): Promise<boolean> {
        const result = await this.post<boolean>(
            ApiEndpoints.animal.completeEntry(id),
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

    async getAnimalFurColors() {
        const data = await this.get<IntUtilItem[]>(ApiEndpoints.util.furColor)

        return data
    }

    async addAnimalFurColor(data: { name: string }): Promise<IntUtilItem> {
        const result = await this.post<IntUtilItem>(
            ApiEndpoints.util.furColor,
            data
        )

        return result
    }

    async newAdopter(data: NewAdopter): Promise<Adopter> {
        const result = await this.post<Adopter>(
            ApiEndpoints.adopter.create,
            data
        )

        return result
    }

    async searchAdopter(
        query: AdopterSearch
    ): Promise<PaginatedAdopterSearchResult> {
        const result = await this.get<PaginatedAdopterSearchResult>(
            ApiEndpoints.adopter.search,
            query
        )

        return result
    }

    async newAnimalAdoption(data: NewAnimalAdoption) {
        const result = await this.post<number>(
            ApiEndpoints.adoption.create,
            data
        )
        return result
    }

    async animalExit(data: AnimalExit) {
        const result = await this.post<void>(
            ApiEndpoints.animal.exit(data.animal_id),
            data
        )

        return result
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
            new Blob([result.data], { type: filetype })
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
            new Blob([result.data], { type: filetype })
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
            new Blob([result.data], { type: filetype })
        )
        return { url, filename }
    }

    async searchVet(query: VetSearch): Promise<PaginatedVetSearchResult> {
        const result = await this.get<PaginatedVetSearchResult>(
            ApiEndpoints.vet.search,
            query
        )

        return result
    }

    async newVet(data: NewVet): Promise<Vet> {
        const result = await this.post<Vet>(ApiEndpoints.vet.create, data)

        return result
    }
}

export default ApiService
