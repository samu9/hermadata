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

const generateItems = (data: Animal): Item[] => [
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
        label: "Dati sanitari",
        icon: <FontAwesomeIcon icon={faHospital} fixedWidth className="px-1" />,
        path: "health",
    },
    {
        label: "Modifica",
        icon: <FontAwesomeIcon icon={faPencil} fixedWidth className="px-1" />,
        path: "edit",
    },
    ...((!data.exit_date && [
        {
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
        },
    ]) ||
        []),
]

const AnimalRecord = (props: Props) => {
    const navigate = useNavigate()
    const { id } = useParams()

    const location = useLocation()
    const items: Item[] = generateItems(props.data)
    const [activeIndex, setActiveIndex] = useState(1)

    const { addButton, removeButton } = useToolbar()

    useEffect(() => {
        if (props.data?.exit_date) {
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
    }, [])
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
