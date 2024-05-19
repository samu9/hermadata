import { z } from "zod"

export const animalCodeValidator = z.string().length(13)
export const animalRaceValidator = z.string().length(1)
export const cityCodeValidator = z.string().regex(/[A-Z]\d{3}/)
export const provinceValidator = z.string().length(2)
export const breedNameValidator = z
    .string({
        required_error: "Il nome è obbligatorio",
    })
    .regex(/^(.*[a-zA-Z]){2,}.*$/)

export const dateFromString = z.preprocess(
    (arg) => (typeof arg == "string" ? new Date(arg) : arg),
    z.date().nullable()
)
export const dateOnly = dateFromString.transform((d: Date | null) => {
    // prime-react calendar returns a date at 0 hour at local time.
    // this results at an UTC date for the previous day at 23 hour.
    if (!d) {
        return null
    }
    d.setHours(0, 0, 0, 0)
    const tzoffset = d.getTimezoneOffset() * 60000 //offset in milliseconds
    const withoutTimezone = new Date(d.valueOf() - tzoffset)
        .toISOString()
        .slice(0, -1)

    return withoutTimezone
})

export const docKindNameValidator = z
    .string()
    .min(3, "Il nome deve avere almeno 3 caratteri.")

export const chipCodeValidator = z
    .string()
    .regex(/\d{3}\.\d{3}\.\d{3}\.\d{3}\.\d{3}/, "Codice chip non valido")
