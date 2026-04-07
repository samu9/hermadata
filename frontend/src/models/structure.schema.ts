import { z } from "zod"

export const structureTypeSchema = z.enum(["S", "R"])

export const structureSchema = z.object({
    id: z.number(),
    name: z.string(),
    city_id: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    structure_type: structureTypeSchema,
})

export type Structure = z.infer<typeof structureSchema>

export const STRUCTURE_TYPE_LABELS: Record<string, string> = {
    S: "Sanitario",
    R: "Rifugio",
}
