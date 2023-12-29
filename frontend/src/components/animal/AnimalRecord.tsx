import { Animal } from "../../models/animal.schema"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFile,
    faHome,
    faList,
    faPencil,
} from "@fortawesome/free-solid-svg-icons"
import { TabMenu } from "primereact/tabmenu"
import { MenuItem } from "primereact/menuitem"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import AnimalRecordHeader from "./AnimalRecordHeader"
import { useEffect, useState } from "react"

type Props = {
    data: Animal
}

const items = [
    {
        label: "Panoramica",
        icon: <FontAwesomeIcon icon={faHome} fixedWidth className="px-1" />,
        path: "overview",
    },
    {
        label: "Documenti",
        icon: <FontAwesomeIcon icon={faFile} fixedWidth className="px-1" />,
        path: "docs",
    },
    {
        label: "Eventi",
        icon: <FontAwesomeIcon icon={faList} fixedWidth className="px-1" />,
        path: "events",
    },
    {
        label: "Modifica",
        icon: <FontAwesomeIcon icon={faPencil} fixedWidth className="px-1" />,
        path: "edit",
    },
]

const AnimalRecord = (props: Props) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeIndex, setActiveIndex] = useState(1)
    useEffect(() => {
        const pathElements = location.pathname.split("/").filter((e) => e)

        const path = pathElements[pathElements.length - 1]
        const index = items.findIndex((i) => i.path == path)
        if (index >= 0) {
            setActiveIndex(index)
        } else {
            setActiveIndex(0)
            navigate(items[0].path)
        }
    }, [])
    const tabMenuItems: MenuItem[] = items.map((tabItem, i) => ({
        icon: tabItem.icon,
        label: tabItem.label,
        command: () => setActiveIndex(i),
        template: (item, options) => (
            <NavLink
                onClick={(e) => {
                    e.preventDefault()
                    options.onClick(e)
                    navigate(tabItem.path)
                }}
                role="menuitem"
                to={tabItem.path}
                className={options.className}
            >
                <span className={options.iconClassName}>{item.icon}</span>
                <span className={options.labelClassName}>{item.label}</span>
            </NavLink>
        ),
    }))
    return (
        <div>
            <div className="mb-4">
                <AnimalRecordHeader data={props.data} />
            </div>
            <TabMenu
                model={tabMenuItems}
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
            />
            <div className="py-4">
                <Outlet />
            </div>
        </div>
    )
}

export default AnimalRecord
