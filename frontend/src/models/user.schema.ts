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
    role: z.string().optional(),
    permissions: z.array(z.string()).optional(),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const userSchema = z.object({
    username: z.string(),
    is_superuser: z.boolean(),
    email: z.string().optional(),
    role: z.string().optional(),
    permissions: z.array(z.string()).default([]),
})

export type User = z.infer<typeof userSchema>

// Extended user schema for management
export const managementUserSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email(),
    is_active: z.boolean(),
    is_superuser: z.boolean(),
    role_name: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string().optional(),
    last_login: z.string().optional(),
})

export type ManagementUser = z.infer<typeof managementUserSchema>

export const createUserSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    is_active: z.boolean().default(true),
    is_superuser: z.boolean().default(false),
})

export type CreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
    email: z.string().email().optional(),
    is_active: z.boolean().optional(),
    is_superuser: z.boolean().optional(),
})

export type UpdateUser = z.infer<typeof updateUserSchema>

export const userActivitySchema = z.object({
    id: z.number(),
    user_id: z.number(),
    user_name: z.string(),
    user_email: z.string(),
    action: z.string(),
    description: z.string(),
    timestamp: z.string(),
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
})

export type UserActivity = z.infer<typeof userActivitySchema>

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "La password attuale è richiesta"),
        newPassword: z
            .string()
            .min(6, "La password deve essere di almeno 6 caratteri"),
        confirmPassword: z.string().min(1, "Conferma la tua password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Le password non corrispondono",
        path: ["confirmPassword"],
    })

export type ChangePassword = z.infer<typeof changePasswordSchema>
