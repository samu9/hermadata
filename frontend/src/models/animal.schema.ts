import { z } from "zod"
import { createPaginatedResponseSchema } from "./pagination.schema"
import {
    animalCodeValidator,
    animalRaceValidator,
    cityCodeValidator,
} from "./validators"

export const newAnimalEntrySchema = z.object({
    race_id: z.string().length(1),
    rescue_city_code: cityCodeValidator,

    entry_type: z.string(),
})

export type NewAnimalEntry = z.infer<typeof newAnimalEntrySchema>

export const animalSchema = z.object({
    code: animalCodeValidator,
    name: z.string().optional(),
    race_id: animalRaceValidator,
    rescue_city: z.string(),
    rescue_province: z.string(),
    entry_date: z.date().nullable(),
    entry_type: z.string(),
    stage: z.string(),
    adoptability_index: z.number(),
})

export type Animal = z.infer<typeof animalSchema>

export const animalSearchResultSchema = z.object({
    code: z.string(), //animalCodeValidator,
    name: z.string().nullable(),
    race_id: animalRaceValidator,
    rescue_city_code: cityCodeValidator,
    rescue_city: z.string(),
    rescue_province: z.string().length(2),
    entry_date: z
        .string()
        .nullable()
        .transform((str) => (str && new Date(str)) || null),
})

export type AnimalSearchResult = z.infer<typeof animalSearchResultSchema>

export const paginatedAnimalSearchResultSchema = createPaginatedResponseSchema(
    animalSearchResultSchema
)

export type PaginatedAnimalSearchResult = z.infer<
    typeof paginatedAnimalSearchResultSchema
>
