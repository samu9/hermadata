import { useAuth } from "../contexts/AuthContext"

export const usePermissions = () => {
    const { hasPermission, isSuperUser, user } = useAuth()

    return {
        hasPermission,
        isSuperUser,
        user,
        canAccessSuperUserFeatures: () => hasPermission('superuser'),
    }
}