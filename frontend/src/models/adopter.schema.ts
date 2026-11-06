import { z } from "zod"
import {
    createPaginatedResponseSchema,
    paginationQuerySchema,
} from "./pagination.schema"

export const newAdopterSchema = z.object({
    name: z.string().trim().min(1),
    surname: z.string().trim().min(1),
    fiscal_code: z.string().trim().min(16).max(16),
    residence_city_code: z.string().trim().min(4).max(4),
    phone: z.string().trim().min(9),
    document_type: z.string().trim().length(2),
    document_number: z.string().trim(),
})

export type NewAdopter = z.infer<typeof newAdopterSchema>

export const adopterSchema = newAdopterSchema.extend({
    id: z.number(),
    document_type: z.string().trim().length(2).nullish(),
    document_number: z.string().trim().nullish(),
    city: z.string().trim().nullish(),
})

export type Adopter = z.infer<typeof adopterSchema>

export const adopterSearchSchema = paginationQuerySchema.extend({
    name: z.string().trim().nullish(),
    surname: z.string().trim().nullish(),
    fiscal_code: z.string().trim().nullish(),
    phone: z.string().trim().nullish(),
    city: z.string().trim().nullish(),
    sort_field: z.string().nullish(),
    sort_order: z.number().nullish(),
})

export type AdopterSearch = z.infer<typeof adopterSearchSchema>

export const paginatedAdopterSearchResultSchema =
    createPaginatedResponseSchema(adopterSchema)

export type PaginatedAdopterSearchResult = z.infer<
    typeof paginatedAdopterSearchResultSchema
>
