import { z } from "zod"
import {
    createPaginatedResponseSchema,
    paginationQuerySchema,
} from "./pagination.schema"
import {
    animalCodeValidator,
    animalRaceValidator,
    chipCodeValidator,
    cityCodeValidator,
    dateFromString,
    dateOnly,
} from "./validators"

export const newAnimalEntrySchema = z.object({
    race_id: z.string().length(1).nullish(),
    rescue_city_code: cityCodeValidator,

    entry_type: z.string(),
})

export type NewAnimalEntry = z.infer<typeof newAnimalEntrySchema>

export const animalSchema = z.object({
    code: animalCodeValidator,
    name: z.string().nullable().optional(),
    race_id: animalRaceValidator,
    breed_id: z.number().nullish(),
    sterilized: z.boolean().nullish(),

    entry_date: dateOnly,
    entry_type: z.string(),

    exit_date: dateOnly.nullish(),
    exit_type: z.string().nullish(),

    stage: z.string().nullish(),
    adoptability_index: z.number().optional(),
    chip_code: z.string().nullish(),
    chip_code_set: z.boolean(),
    img_path: z.string().nullable(),
    sex: z.number().nullable(),
    notes: z.string().nullish(),
    fur: z.number().nullish(),
    size: z.number().nullish(),
})

export type Animal = z.infer<typeof animalSchema>

export const animalEditSchema = z.object({
    name: z.string().nullable().optional(),
    chip_code: z.preprocess(
        (arg) => (arg === "" ? null : arg),
        chipCodeValidator.nullish()
    ),
    chip_code_set: z.boolean(),

    birth_date: dateOnly.nullish(),
    fur: z.number().nullish(),
    size: z.number().nullish(),
    sterilized: z.boolean().nullish(),
    sex: z.number().nullable(),
    breed_id: z.number().nullish(),
    notes: z.string().nullish(),
})

export type AnimalEdit = z.infer<typeof animalEditSchema>

export const animalCompleteEntrySchema = z.object({
    entry_date: dateOnly,
})
export type AnimalCompleteEntry = z.infer<typeof animalCompleteEntrySchema>

export const animalSearchResultSchema = z.object({
    id: z.number(),
    code: z.string(), //animalCodeValidator,
    name: z.string().nullable(),
    race_id: animalRaceValidator,
    chip_code: z.string().nullish(),
    rescue_city_code: cityCodeValidator,
    rescue_city: z.string(),
    rescue_province: z.string().length(2),
    entry_date: z
        .string()
        .nullable()
        .transform((str) => (str && new Date(str)) || null),
    entry_type: z.string(),
    exit_date: z
        .string()
        .nullish()
        .transform((str) => (str && new Date(str)) || null),
    exit_type: z.string().nullish(),
})

export type AnimalSearchResult = z.infer<typeof animalSearchResultSchema>

export const paginatedAnimalSearchResultSchema = createPaginatedResponseSchema(
    animalSearchResultSchema
)

export type PaginatedAnimalSearchResult = z.infer<
    typeof paginatedAnimalSearchResultSchema
>

export const animalDocUploadSchema = z.object({
    title: z.string().min(1),
    document_kind_code: z.string().min(1),
    document_id: z.number(),
})

export type AnimalDocUpload = z.infer<typeof animalDocUploadSchema>

export const animalDocumentSchema = z.object({
    animal_id: z.number(),
    document_id: z.number(),
    document_kind_code: z.string(),
    created_at: dateFromString,
})

export type AnimalDocument = z.infer<typeof animalDocumentSchema>

export const animalSearchQuerySchema = paginationQuerySchema.extend({
    rescue_city_code: z.string().nullish(),
    entry_type: z.string().nullish(),
    exit_type: z.string().nullish(),
    present: z.boolean().nullish(),
    not_present: z.boolean().nullish(),
    name: z.string().nullish(),
    chip_code: z.string().nullish(),
    sort_field: z.string().nullish(),
    sort_order: z.number().nullish(),
})

export type AnimalSearchQuery = z.infer<typeof animalSearchQuerySchema>

export const newAnimalAdoptionSchema = z.object({
    animal_id: z.number(),
    adopter_id: z.number(),
    completed: z.boolean().nullish(),
})

export type NewAnimalAdoption = z.infer<typeof newAnimalAdoptionSchema>

export const animalExitSchema = z.object({
    animal_id: z.number(),
    exit_type: z.string(),
    exit_date: dateOnly,
    exit_data: z.record(z.string(), z.any()).nullish(),
})

export type AnimalExit = z.infer<typeof animalExitSchema>

export const animalDaysRequestSchema = z.object({
    from_date: dateOnly,
    to_date: dateOnly,
    city_code: z.string(),
})

export type AnimalDaysRequestSchema = z.infer<typeof animalDaysRequestSchema>
