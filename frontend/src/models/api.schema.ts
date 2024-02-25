import { z } from "zod"

export const apiErrorSchema = z.object({
    code: z.string(),
    content: z.any().nullish(),
    message: z.string().nullish(),
})

export type ApiError = z.infer<typeof apiErrorSchema>
