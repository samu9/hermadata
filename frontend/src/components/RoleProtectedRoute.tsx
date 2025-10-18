import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Loader from "../components/Loader"

interface RoleProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: 'superuser'
    fallbackPath?: string
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
    children, 
    requiredRole,
    fallbackPath = "/" 
}) => {
    const { isAuthenticated, loading, hasPermission } = useAuth()

    if (loading) {
        return <Loader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && !hasPermission(requiredRole)) {
        return <Navigate to={fallbackPath} replace />
    }

    return <>{children}</>
}

export default RoleProtectedRoute