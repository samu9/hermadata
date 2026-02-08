import { z } from "zod"

export const intUtilItemSchema = z.object({
    id: z.number(),
    label: z.string(),
})

export type IntUtilItem = z.infer<typeof intUtilItemSchema>

export const animalEventTypeSchema = z.object({
    code: z.string(),
    description: z.string(),
    category: z.string(),
})

export type AnimalEventType = z.infer<typeof animalEventTypeSchema>
