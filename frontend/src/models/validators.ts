import { z } from "zod"

export const animalCodeValidator = z.string().length(11)
export const animalRaceValidator = z.string().length(1)
export const cityCodeValidator = z.string().regex(/[A-Z]\d{3}/)
export const provinceValidator = z.string().length(2)
export const breedNameValidator = z
    .string({
        required_error: "Il nome è obbligatorio",
    })
    .regex(/(.*){1,}/)

export const dateOnly = z
    .preprocess(
        (arg) => (typeof arg == "string" ? new Date(arg) : arg),
        z.date()
    )
    .transform((d) => {
        // prime-react calendar returns a date at 0 hour at local time.
        // this results at an UTC date for the previous day at 23 hour.

        d.setUTCDate(d.getDate())
        d.setUTCHours(0, 0, 0, 0)
        return new Date(d)
    })
