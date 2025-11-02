import { z } from "zod"

export const permissionSchema = z.object({
    code: z.string(),
    description: z.string().nullable(),
})

export type Permission = z.infer<typeof permissionSchema>