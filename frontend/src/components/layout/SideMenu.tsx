import { Divider } from "primereact/divider"
import { MenuItem } from "primereact/menuitem"
import { NavLink, Navigate } from "react-router-dom"
import LoggedUserCard from "../LoggedUserCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import {
    faDatabase,
    faDog,
    faHome,
    faPerson,
    faUserDoctor,
} from "@fortawesome/free-solid-svg-icons"

type CustomMenuItem = MenuItem & { route?: string }

const menuItems: CustomMenuItem[] = [
    { label: "Home", route: "/" },
    {
        label: "Animali",
        route: "/animals",
    },
    {
        label: "Adottanti",
        route: "/adopters",
    },
]
type MenuElementProps = {
    to: string
    label: string | React.ReactNode
    icon?: IconProp
}
const MenuElement = (props: MenuElementProps) => (
    <NavLink to={props.to}>
        <div className="p-2 w-full bg-slate-200 rounded hover:bg-slate-50 font-light flex gap-2 items-center">
            {props.icon && (
                <FontAwesomeIcon
                    fixedWidth
                    className="text-sm text-gray-700"
                    icon={props.icon}
                />
            )}
            {props.label}
        </div>
    </NavLink>
)
const SideMenu = () => {
    const items = menuItems.map((i) => {
        if (i.route) {
            i.command = (e) => <Navigate to={i.route!} />

            delete i.route
        }
        return i
    })
    return (
        <div className="h-screen w-64 bg-slate-300 pt-4 border-r border-slate-400">
            <div className="w-full font-bold text-[1.5rem] text-slate-700 px-4">
                Hermadata
            </div>
            <div className="p-4">
                <LoggedUserCard />
                <Divider />
                <div>
                    <div className="mb-2 font-bold text-slate-700">Menu</div>
                    <div className="flex flex-col gap-2">
                        <MenuElement icon={faHome} to="/" label="Home" />
                        <MenuElement
                            icon={faDog}
                            to="/animal"
                            label="Animali"
                        />
                        <MenuElement
                            icon={faPerson}
                            to="/adopters"
                            label="Adottanti"
                        />
                        <MenuElement
                            icon={faUserDoctor}
                            to="/vets"
                            label="Veterinari"
                        />
                        <MenuElement
                            icon={faDatabase}
                            to="/exports"
                            label="Estrazioni"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideMenu
