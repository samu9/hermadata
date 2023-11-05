import { z } from "zod"

export const raceSchema = z.object({
    code: z.string().length(1),
    name: z.string(),
})

export type RaceSchema = z.infer<typeof raceSchema>
