import { z } from "zod"
import { breedNameValidator } from "./validators"

export const addBreedSchema = z.object({
    name: breedNameValidator,
    race_id: z.string().length(1),
})
export type NewBreed = z.infer<typeof addBreedSchema>

export const breedSchema = z.object({
    id: z.number(),
    name: breedNameValidator,
    race_id: z.string().length(1),
})

export type Breed = z.infer<typeof breedSchema>
