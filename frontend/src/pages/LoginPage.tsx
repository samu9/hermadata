import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoginForm from "../components/user/LoginForm"
import logo from "../assets/hermadata.svg"

const LoginPage = () => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="flex flex-col items-center gap-5">
                    <img src={logo} alt="Hermadata" className="w-14 h-14 opacity-60" />
                    <div className="w-8 h-8 rounded-full border-[3px] border-primary-200 border-t-primary-600 animate-spin" />
                </div>
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <LoginForm />
}

export default LoginPage
