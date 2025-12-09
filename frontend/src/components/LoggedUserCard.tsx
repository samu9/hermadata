import { Button } from "primereact/button"
import { classNames } from "primereact/utils"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const LoggedUserCard = () => {
    const { logout, isAuthenticated, user, isSuperUser } = useAuth()

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800 border border-surface-700 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-300 font-bold text-lg border border-primary-800">
                {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <Link
                    to="/profile"
                    className="font-semibold text-sm text-surface-100 truncate hover:text-primary-400 transition-colors block"
                >
                    {user?.username || "Username"}
                </Link>
                {isSuperUser && (
                    <div className="text-xs text-primary-400 font-medium flex items-center gap-1">
                        <i className="pi pi-shield text-[10px]"></i>
                        Superuser
                    </div>
                )}
            </div>
            <Button
                icon="pi pi-sign-out"
                className="w-8 h-8 !p-0 text-surface-400 hover:text-surface-200 hover:bg-surface-700"
                text
                rounded
                onClick={logout}
                tooltip="Esci"
                tooltipOptions={{ position: "top" }}
            />
        </div>
    )
}

export default LoggedUserCard
