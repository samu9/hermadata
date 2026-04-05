import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useStructure } from "../contexts/StructureContext"
import { STRUCTURE_TYPE_LABELS } from "../models/structure.schema"

const LoggedUserCard = () => {
    const { logout, isAuthenticated, user, isSuperUser } = useAuth()
    const { structures, currentStructure, setCurrentStructure } =
        useStructure()

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex flex-col gap-2">
            {structures.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                    <i className="pi pi-building text-surface-400 text-xs" />
                    <Dropdown
                        value={currentStructure}
                        options={structures}
                        optionLabel="name"
                        onChange={(e) => setCurrentStructure(e.value)}
                        placeholder="Struttura"
                        className="flex-1 text-xs [&_.p-dropdown-label]:text-xs [&_.p-dropdown-label]:py-1"
                        itemTemplate={(option) => (
                            <div className="text-xs">
                                <div className="font-medium">{option.name}</div>
                                <div className="text-surface-400">
                                    {STRUCTURE_TYPE_LABELS[option.structure_type]}
                                </div>
                            </div>
                        )}
                    />
                </div>
            )}
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
        </div>
    )
}

export default LoggedUserCard
