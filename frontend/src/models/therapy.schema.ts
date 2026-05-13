import { z } from "zod"

export const reminderUnitSchema = z.enum(["day", "week", "month", "year"])
export type ReminderUnit = z.infer<typeof reminderUnitSchema>

export const reminderUnitLabels: Record<ReminderUnit, string> = {
    day: "giorni",
    week: "settimane",
    month: "mesi",
    year: "anni",
}

export const therapySchema = z.object({
    id: z.number(),
    animal_id: z.number(),
    start_date: z.string(),
    end_date: z.string().nullable(),
    description: z.string(),
    reminder_value: z.number().nullable(),
    reminder_unit: reminderUnitSchema.nullable(),
    animal_log_id: z.number().nullable(),
    prescription_document_id: z.number().nullable(),
    transport_document_id: z.number().nullable(),
})

export type Therapy = z.infer<typeof therapySchema>

export const therapyReminderSchema = z.object({
    therapy_id: z.number(),
    animal_id: z.number(),
    animal_code: z.string(),
    animal_name: z.string().nullable(),
    description: z.string(),
    next_due_date: z.string(),
    reminder_value: z.number(),
    reminder_unit: reminderUnitSchema,
})

export type TherapyReminder = z.infer<typeof therapyReminderSchema>

export const newTherapySchema = z.object({
    start_date: z.string().min(1, "Data inizio obbligatoria"),
    end_date: z.string().nullable().optional(),
    description: z.string().min(1, "Descrizione obbligatoria"),
    reminder_value: z.number().int().positive().nullable().optional(),
    reminder_unit: reminderUnitSchema.nullable().optional(),
})

export type NewTherapy = z.infer<typeof newTherapySchema>
