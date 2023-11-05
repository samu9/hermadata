import { z } from "zod"

export const newAnimalSchema = z.object({
    race: z.string().length(1),
    origin_city_code: z.string(), //.regex(/[A-Z]\d{3/),
    // sex: z.number(),
    name: z.string().min(2).max(100).optional(),
})

export type NewAnimalSchema = z.infer<typeof newAnimalSchema>
