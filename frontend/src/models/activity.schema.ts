import { z } from "zod"
import { createPaginatedResponseSchema } from "./pagination.schema"

export const activitySchema = z.object({
    id: z.number(),
    animal_id: z.number(),
    user_id: z.number().nullable(),
    user_name: z.string().nullable().optional(),
    event_description: z.string().nullable().optional(),
    data: z.record(z.any()).nullable(),
    created_at: z.string(),
})

export type Activity = z.infer<typeof activitySchema>

export const activityFilterQuerySchema = z.object({
    user_id: z.number().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    from_index: z.number().optional(),
    to_index: z.number().optional(),
    sort_field: z.string().optional(),
    sort_order: z.number().optional(),
})

export type ActivityFilterQuery = z.infer<typeof activityFilterQuerySchema>

export const paginatedActivitySchema =
    createPaginatedResponseSchema(activitySchema)

export type PaginatedActivityResult = z.infer<typeof paginatedActivitySchema>
