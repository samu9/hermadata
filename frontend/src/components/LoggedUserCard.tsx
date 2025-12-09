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
        <div
            className={classNames(
                "rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-between p-3 mt-auto",
                { "border-primary-500/50": isSuperUser }
            )}
        >
            <div className="flex flex-col overflow-hidden">
                <Link
                    to="/profile"
                    className="hover:text-primary-400 transition-colors"
                >
                    <div className="text-sm font-medium text-surface-200 truncate">
                        {user?.username || "Username"}
                    </div>
                    {isSuperUser && (
                        <div className="text-[10px] text-primary-400 uppercase tracking-wider font-bold">
                            Superuser
                        </div>
                    )}
                </Link>
            </div>
            <Button
                icon="pi pi-sign-out"
                className="w-8 h-8 !p-0 text-surface-400 hover:text-white hover:bg-surface-700"
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
