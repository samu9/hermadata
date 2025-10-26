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
                { "border-blue-400 bg-blue-100": isSuperUser },
                "rounded-lg bg-slate-100 border border-slate-400 flex items-center justify-start gap-2 px-4"
            )}
        >
            {/* <Avatar size="normal" /> */}
            <div className="flex flex-col flex-grow">
                <Link to="/profile">
                    <div className="text-xs font-medium">
                        {user?.username || "Username"}
                    </div>
                </Link>
            </div>
            <Button
                size="small"
                text
                severity="secondary"
                onClick={logout}
                label="Esci"
            />
        </div>
    )
}

export default LoggedUserCard
