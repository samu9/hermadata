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

    return <LoginForm />
}

export default LoginPage
