import { z } from "zod"

export const animalCodeValidator = z.string().length(11)
export const animalRaceValidator = z.string().length(1)
export const cityCodeValidator = z.string().regex(/[A-Z]\d{3}/)
export const provinceValidator = z.string().length(2)
