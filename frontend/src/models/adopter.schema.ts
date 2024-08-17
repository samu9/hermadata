import { z } from "zod"
import { dateOnly } from "./validators"
import {
    createPaginatedResponseSchema,
    paginationQuerySchema,
} from "./pagination.schema"

export const newAdopterSchema = z.object({
    name: z.string().min(1),
    surname: z.string().min(1),
    birth_date: dateOnly,
    birth_city_code: z.string().min(4).max(4),
    fiscal_code: z.string().min(16).max(16),
    residence_city_code: z.string().min(4).max(4),
    phone: z.string().min(9),
})

export type NewAdopter = z.infer<typeof newAdopterSchema>

export const adopterSchema = newAdopterSchema.extend({
    id: z.number(),
})

export type Adopter = z.infer<typeof adopterSchema>

export const adopterSearchSchema = paginationQuerySchema.extend({
    name: z.string().nullish(),
    surname: z.string().nullish(),
    fiscal_code: z.string().nullish(),
    sort_field: z.string().nullish(),
    sort_order: z.number().nullish(),
})

export type AdopterSearch = z.infer<typeof adopterSearchSchema>

export const paginatedAdopterSearchResultSchema =
    createPaginatedResponseSchema(adopterSchema)

export type PaginatedAdopterSearchResult = z.infer<
    typeof paginatedAdopterSearchResultSchema
>
