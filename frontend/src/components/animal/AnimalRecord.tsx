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
                className={classNames(
                    "flex items-center px-4 py-3 font-medium transition-all duration-200 border-b-2 outline-none focus:outline-none",
                    {
                        "border-primary-600 text-primary-700":
                            activeIndex === i,
                        "border-transparent text-surface-600 hover:text-surface-900 hover:border-surface-300":
                            activeIndex !== i,
                        "opacity-50 cursor-not-allowed": item.disabled,
                        "cursor-pointer": !item.disabled,
                    }
                )}
            >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
            </NavLink>
        ),
    }))
    return (
        <div>
            <div className="mb-6">
                <AnimalRecordHeader data={props.data} />
            </div>
            <TabMenu
                model={tabMenuItems}
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                pt={{
                    root: {
                        className:
                            "bg-transparent border-b border-surface-200 mb-6",
                    },
                    menu: {
                        className: "bg-transparent border-none flex flex-wrap",
                    },
                    menuitem: { className: "bg-transparent border-none mr-2" },
                    action: { className: "hidden" }, // Hide default action since we use template
                }}
            />
            <div className="py-4 animate-fade-in">
                <Outlet />
            </div>
        </div>
    )
}

export default AnimalRecord
