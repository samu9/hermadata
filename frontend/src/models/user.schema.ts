import { z } from "zod"

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export type Login = z.infer<typeof loginSchema>

export const loginResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
    username: z.string().optional(),
    is_superuser: z.boolean().optional(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const userSchema = z.object({
    username: z.string(),
    is_superuser: z.boolean(),
    email: z.string().optional(),
})

export type User = z.infer<typeof userSchema>
