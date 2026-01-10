import { Divider } from "primereact/divider"
import { NavLink } from "react-router-dom"
import LoggedUserCard from "../LoggedUserCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import {
    faDatabase,
    faDog,
    faListDots,
    faPerson,
    faUserDoctor,
    faUserShield,
} from "@fortawesome/free-solid-svg-icons"
import { usePermissions } from "../../hooks/usePermissions"
import logo from "../../assets/hermadata.svg"
import { useAuth } from "../../contexts/AuthContext"
import { Permission } from "../../constants"
import { classNames } from "primereact/utils"
type MenuElementProps = {
    to: string
    label: string | React.ReactNode
    icon?: IconProp
}
const MenuElement = (props: MenuElementProps) => (
    <NavLink
        to={props.to}
        className={({ isActive }) =>
            classNames(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                {
                    "bg-primary-600 text-white shadow-md shadow-primary-900/20":
                        isActive,
                    "text-surface-400 hover:bg-surface-800 hover:text-surface-100":
                        !isActive,
                }
            )
        }
    >
        {({ isActive }) => (
            <>
                {props.icon && (
                    <FontAwesomeIcon
                        fixedWidth
                        className={classNames("text-sm transition-colors", {
                            "text-white": isActive,
                            "text-surface-500 group-hover:text-surface-300":
                                !isActive,
                        })}
                        icon={props.icon}
                    />
                )}
                <span className="font-medium text-sm">{props.label}</span>
            </>
        )}
    </NavLink>
)
const SideMenu = () => {
    const { can } = useAuth()
    const { canAccessSuperUserFeatures } = usePermissions()

    return (
        <div className="h-screen w-72 bg-surface-900 flex flex-col border-r border-surface-800 shadow-xl z-20">
            <div className="flex items-center gap-3 px-6 py-6 mb-2">
                <img src={logo} className="w-8 h-8" alt="Logo" />
                <div className="font-bold text-xl text-white tracking-tight">
                    Hermadata
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 mt-2 px-3">
                    Menu
                </div>

                <MenuElement to="/" label="Bacheca" icon={faListDots} />

                <MenuElement to="/animal" label="Animali" icon={faDog} />

                {can(Permission.BROWSE_ADOPTERS) && (
                    <MenuElement
                        to="/adopters"
                        label="Adottanti"
                        icon={faPerson}
                    />
                )}

                {can(Permission.BROWSE_VETS) && (
                    <MenuElement
                        to="/vets"
                        label="Veterinari"
                        icon={faUserDoctor}
                    />
                )}

                {can(Permission.DOWNLOAD_SUMMARY) && (
                    <MenuElement
                        to="/exports"
                        label="Estrazioni"
                        icon={faDatabase}
                    />
                )}

                {canAccessSuperUserFeatures() && (
                    <>
                        <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 mt-6 px-3">
                            Amministrazione
                        </div>
                        <MenuElement
                            to="/admin"
                            label="Pannello Admin"
                            icon={faUserShield}
                        />
                    </>
                )}
            </div>

            <div className="p-4 border-t border-surface-800 bg-surface-900">
                <LoggedUserCard />
            </div>
        </div>
    )
}

export default SideMenu
