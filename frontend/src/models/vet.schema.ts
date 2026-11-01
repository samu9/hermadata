import { z } from "zod"
import {
    createPaginatedResponseSchema,
    paginationQuerySchema,
} from "./pagination.schema"

const FISCAL_CODE = z.union([
    z.string().trim().min(16).max(16),
    z.string().trim().regex(/^\d{9}$/),
])
export const newVetSchema = z.object({
    name: z.string().trim().nullish(),
    surname: z.string().trim().nullish(),
    business_name: z.string().trim(),
    fiscal_code: FISCAL_CODE,
    phone: z.string().trim().min(9).nullable(),
})

export type NewVet = z.infer<typeof newVetSchema>

export const vetSchema = newVetSchema.extend({
    id: z.number(),
})

export type Vet = z.infer<typeof vetSchema>

export const vetSearchSchema = paginationQuerySchema.extend({
    name: z.string().trim().nullish(),
    surname: z.string().trim().nullish(),
    fiscal_code: FISCAL_CODE.nullish(),
    sort_field: z.string().nullish(),
    sort_order: z.number().nullish(),
})

export type VetSearch = z.infer<typeof vetSearchSchema>

export const paginatedVetSearchResultSchema =
    createPaginatedResponseSchema(vetSchema)

export type PaginatedVetSearchResult = z.infer<
    typeof paginatedVetSearchResultSchema
>
