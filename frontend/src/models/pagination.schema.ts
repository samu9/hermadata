import { z } from "zod"

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
    itemSchema: T
) =>
    z.object({
        total: z.number(),
        items: z.array(itemSchema),
    })

export const paginationQuerySchema = z.object({
    from_index: z.number().positive().optional(),
    to_index: z.number().positive().optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
