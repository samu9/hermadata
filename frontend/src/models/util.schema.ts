import { z } from "zod"

export const intUtilItemSchema = z.object({
    id: z.number(),
    label: z.string(),
})

export type IntUtilItem = z.infer<typeof intUtilItemSchema>
