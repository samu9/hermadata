import { z } from "zod"

export const raceSchema = z.object({
    id: z.string().length(1),
    name: z.string(),
})

export type Race = z.infer<typeof raceSchema>
