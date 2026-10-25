import { z } from "zod"

export const permissionSchema = z.object({
    code: z.string(),
    description: z.string().nullable(),
})

export type Permission = z.infer<typeof permissionSchema>

export const userPermissionDetailSchema = z.object({
    code: z.string(),
    description: z.string().nullable(),
    // permission granted by the user's role
    from_role: z.boolean(),
    // null = inherit from role, true = granted, false = revoked
    override: z.boolean().nullable(),
    effective: z.boolean(),
})

export type UserPermissionDetail = z.infer<typeof userPermissionDetailSchema>

export type UserPermissionOverride = {
    permission_code: string
    granted: boolean
}
