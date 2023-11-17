import { z } from "zod"

export const newAnimalSchema = z.object({
    race: z.string().length(1),
    origin_city_code: z.string().regex(/[A-Z]\d{3}/),
    // sex: z.number(),
    finding_date: z.string().regex(/\d{4}-\d{2}-\d{2}/),
})

export type NewAnimalSchema = z.infer<typeof newAnimalSchema>
