import { z } from "zod"

export const healthActivityWriteSchema = z.object({
    activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data obbligatoria")
        .refine((value) => {
            const date = new Date(`${value}T00:00:00Z`)
            return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
        }, "Data non valida"),
    description: z.string().trim().min(1, "Descrizione obbligatoria"),
})

export const healthActivitySchema = healthActivityWriteSchema.extend({
    id: z.number(),
    animal_id: z.number(),
})

export type HealthActivity = z.infer<typeof healthActivitySchema>
export type HealthActivityWrite = z.infer<typeof healthActivityWriteSchema>
export type HealthActivityFilters = {
    description?: string
    from_date?: string
    to_date?: string
}
