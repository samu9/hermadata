import React, { createContext, useContext, useEffect, useState } from "react"
import { apiService } from "../main"
import { User } from "../models/user.schema"

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    isSuperUser: boolean
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
    loading: boolean
    hasPermission: (requiredRole?: "superuser") => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        // Check authentication status on app load
        const checkAuth = () => {
            const authenticated = apiService.isAuthenticated()
            setIsAuthenticated(authenticated)

            if (authenticated) {
                // Load user data from localStorage if available
                const userData = localStorage.getItem("userData")
                if (userData) {
                    try {
                        setUser(JSON.parse(userData))
                    } catch (error) {
                        console.error("Failed to parse user data:", error)
                    }
                }
            }

            setLoading(false)
        }

        checkAuth()
    }, [])

    const login = async (
        username: string,
        password: string
    ): Promise<boolean> => {
        try {
            const loginData = await apiService.login({ username, password })
            if (loginData) {
                setIsAuthenticated(true)

                // Store user data if available in login response
                if (
                    loginData.username !== undefined &&
                    loginData.is_superuser !== undefined
                ) {
                    const userData: User = {
                        username: loginData.username,
                        is_superuser: loginData.is_superuser,
                    }
                    setUser(userData)
                    localStorage.setItem("userData", JSON.stringify(userData))
                }

                return true
            }
            return false
        } catch (error) {
            setIsAuthenticated(false)
            setUser(null)
            return false
        }
    }

    const logout = () => {
        apiService.logout()
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem("userData")
        // Force redirect to login page
        window.location.href = "/login"
    }

    const hasPermission = (requiredRole?: "superuser"): boolean => {
        if (!isAuthenticated) return false

        switch (requiredRole) {
            case "superuser":
                return user?.is_superuser === true
            default:
                return isAuthenticated // Basic authentication check
        }
    }

    const isSuperUser = user?.is_superuser === true

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                isSuperUser,
                login,
                logout,
                loading,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
