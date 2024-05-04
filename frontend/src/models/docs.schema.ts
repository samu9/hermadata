import { z } from "zod"
import { docKindNameValidator } from "./validators"

export const docKindSchema = z.object({
    id: z.number(),
    code: z.string().length(2),
    name: docKindNameValidator,
})

export type DocKind = z.infer<typeof docKindSchema>

export const newDocKindSchema = z.object({
    name: docKindNameValidator,
})

export type NewDocKind = z.infer<typeof newDocKindSchema>
