import { z } from "zod"

export const provinciaSchema = z.object({
    id: z.string().length(2),
    name: z.string(),
})

export type ProvinciaSchema = z.infer<typeof provinciaSchema>

export const comuneSchema = z.object({
    id: z.string().regex(/[A-Z]\d{3}/),
    name: z.string(),
})

export type ComuneSchema = z.infer<typeof comuneSchema>
