import {
    faArrowUpFromBracket,
    faCircleXmark,
    faFile,
    faHome,
    faHospital,
    faList,
    faPencil,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { MenuItem } from "primereact/menuitem"
import { TabMenu } from "primereact/tabmenu"
import { classNames } from "primereact/utils"
import { useEffect, useState } from "react"
import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom"
import { Permission } from "../../constants"
import { useAuth } from "../../contexts/AuthContext"
import { useToolbar } from "../../contexts/Toolbar"
import { Animal } from "../../models/animal.schema"
import NewAnimalForm from "../new-entry/NewAnimalEntryForm"
import AnimalRecordHeader from "./AnimalRecordHeader"

type Props = {
    data: Animal
}

type Item = {
    label: string
    icon: JSX.Element
    path: string
    disabled?: boolean
}

const generateItems = (
    data: Animal,
    can: (permissionCode: string) => boolean
): Item[] => {
    const items: Item[] = [
        {
            label: "Panoramica",
            icon: <FontAwesomeIcon icon={faHome} fixedWidth className="px-1" />,
            path: "overview",
        },
    ]

    // Documents tab - requires document viewing permissions
    can(Permission.DOWNLOAD_DOCUMENT) &&
        items.push({
            label: "Documenti",
            icon: <FontAwesomeIcon icon={faFile} fixedWidth className="px-1" />,
            path: "docs",
        })

    // Events tab - always visible for now (could add specific permission later)
    items.push({
        label: "Eventi",
        icon: <FontAwesomeIcon icon={faList} fixedWidth className="px-1" />,
        path: "events",
    })

    // Health data tab - always visible for now (could add specific permission later)
    items.push({
        label: "Dati sanitari",
        icon: <FontAwesomeIcon icon={faHospital} fixedWidth className="px-1" />,
        path: "health",
    })

    // Edit tab - requires animal editing permissions
    can(Permission.EDIT_ANIMAL) &&
        items.push({
            label: "Modifica",
            icon: (
                <FontAwesomeIcon icon={faPencil} fixedWidth className="px-1" />
            ),
            path: "edit",
        })

    // Exit tab - only show if animal hasn't exited yet and user can create animals
    !data.exit_date &&
        can(Permission.CREATE_ANIMAL) &&
        items.push({
            label: "Uscita",
            icon: (
                <FontAwesomeIcon
                    icon={faCircleXmark}
                    fixedWidth
                    className="px-1"
                />
            ),
            path: "exit",
            disabled: Boolean(data.exit_date),
        })

    return items
}

const AnimalRecord = (props: Props) => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { can } = useAuth()

    const location = useLocation()
    const items: Item[] = generateItems(props.data, can)
    const [activeIndex, setActiveIndex] = useState(1)

    const { addButton, removeButton } = useToolbar()

    useEffect(() => {
        if (props.data?.exit_date && can(Permission.CREATE_ANIMAL)) {
            addButton({
                id: "new-entry",
                buttonText: "Nuovo ingresso",
                buttonIcon: faArrowUpFromBracket,
                severity: "success",
                FormComponent: NewAnimalForm,
                formProps: { animalId: id },
                onSuccessAction: (data) => {
                    console.log("Animal document added:", data)
                    removeButton("new-entry")
                },
            })
        }
    }, [props.data?.exit_date, can, addButton, removeButton, id])
    useEffect(() => {
        const pathElements = location.pathname.split("/").filter((e) => e)

        const path = pathElements[pathElements.length - 1]
        const index = items.findIndex((i) => i.path == path)
        if (index >= 0) {
            setActiveIndex(index)
        } else {
            setActiveIndex(0)
            if (items.length > 0) {
                navigate(items[0].path)
            }
        }
    }, [items, location.pathname, navigate])
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
                className={classNames(options.className, "w-[150px]", {
                    "text-yellow-300": item.disabled,
                })}
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
