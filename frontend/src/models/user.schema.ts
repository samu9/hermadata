import { z } from "zod"

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export type Login = z.infer<typeof loginSchema>

export const loginResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
