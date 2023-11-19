import { z } from "zod"
import { cityCodeValidator } from "./validators"

export const newAnimalSchema = z.object({
    race_id: z.string().length(1),
    rescue_city_code: cityCodeValidator,
    rescue_date: z.date().transform((d) => {
        // prime-react calendar returns a date at 0 hour at local time.
        // this results at an UTC date for the previous day at 23 hour.
        d.setUTCDate(d.getDate())
        d.setUTCHours(0, 0, 0, 0)
        return new Date(d)
    }),

    rescue_type: z.string(),
})

export type NewAnimal = z.infer<typeof newAnimalSchema>
