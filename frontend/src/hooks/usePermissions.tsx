import { useAuth } from "../contexts/AuthContext"

export const usePermissions = () => {
    const { hasPermission, isSuperUser, user, can } = useAuth()

    return {
        hasPermission,
        isSuperUser,
        user,
        can,
        canAccessSuperUserFeatures: () => hasPermission('superuser'),
    }
}