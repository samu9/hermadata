import { z } from "zod"
import { createPaginatedResponseSchema } from "./pagination.schema"
import {
    animalCodeValidator,
    animalRaceValidator,
    cityCodeValidator,
} from "./validators"

export const animalSchema = z.object({
    code: animalCodeValidator,
    name: z.string().optional(),
    race_id: animalRaceValidator,
    rescue_city_code: cityCodeValidator,
    rescue_date: z.date(),
    rescue_type: z.string(),
})

export type Animal = z.infer<typeof animalSchema>

export const animalSearchResultSchema = z.object({
    code: z.string(), //animalCodeValidator,
    name: z.string().nullable(),
    race_id: animalRaceValidator,
    rescue_city_code: cityCodeValidator,
    rescue_city: z.string(),
    rescue_province: z.string().length(2),
    rescue_date: z.string().transform((str) => new Date(str)),
})

export type AnimalSearchResult = z.infer<typeof animalSearchResultSchema>

export const paginatedAnimalSearchResultSchema = createPaginatedResponseSchema(
    animalSearchResultSchema
)

export type PaginatedAnimalSearchResult = z.infer<
    typeof paginatedAnimalSearchResultSchema
>
