import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoginForm from "../components/user/LoginForm"

const LoginPage = () => {
    const { isAuthenticated, loading } = useAuth()

    // If already authenticated, redirect to home
    if (loading) {
        return <div>Caricamento...</div>
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}

export default LoginPage
