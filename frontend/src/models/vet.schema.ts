import { z } from "zod"
import {
    createPaginatedResponseSchema,
    paginationQuerySchema,
} from "./pagination.schema"

export const newVetSchema = z.object({
    name: z.string().min(1),
    surname: z.string().min(1),
    business_name: z.string(),
    fiscal_code: z.string().min(16).max(16),
    phone: z.string().min(9),
})

export type NewVet = z.infer<typeof newVetSchema>

export const vetSchema = newVetSchema.extend({
    id: z.number(),
})

export type Vet = z.infer<typeof vetSchema>

export const vetSearchSchema = paginationQuerySchema.extend({
    name: z.string().nullish(),
    surname: z.string().nullish(),
    fiscal_code: z.string().nullish(),
    sort_field: z.string().nullish(),
    sort_order: z.number().nullish(),
})

export type VetSearch = z.infer<typeof vetSearchSchema>

export const paginatedVetSearchResultSchema =
    createPaginatedResponseSchema(vetSchema)

export type PaginatedVetSearchResult = z.infer<
    typeof paginatedVetSearchResultSchema
>
