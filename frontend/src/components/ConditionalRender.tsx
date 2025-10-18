import React from "react"
import { usePermissions } from "../hooks/usePermissions"

interface ConditionalRenderProps {
    children: React.ReactNode
    requiredRole?: 'superuser'
    fallback?: React.ReactNode
}

const ConditionalRender: React.FC<ConditionalRenderProps> = ({
    children,
    requiredRole,
    fallback = null
}) => {
    const { hasPermission } = usePermissions()

    if (requiredRole && !hasPermission(requiredRole)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

export default ConditionalRender