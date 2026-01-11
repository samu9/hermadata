import {
    faArrowUpFromBracket,
    faCircleXmark,
    faFile,
    faHome,
    faHospital,
    faList,
    faPencil,
    faTrash,
    faHouseCircleCheck,
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
import { ConfirmDialog } from "primereact/confirmdialog"
import { Dialog } from "primereact/dialog"
import { Calendar } from "primereact/calendar"
import { Button } from "primereact/button"
import { apiService } from "../../main"
import { useQueryClient } from "react-query"

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
    const { can, isSuperUser } = useAuth()
    const queryClient = useQueryClient()

    const location = useLocation()
    const items: Item[] = generateItems(props.data, can)
    const [activeIndex, setActiveIndex] = useState(1)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [moveToShelterDialogVisible, setMoveToShelterDialogVisible] =
        useState(false)
    const [moveToShelterDate, setMoveToShelterDate] = useState<Date | null>(
        new Date()
    )
    const [isMovingToShelter, setIsMovingToShelter] = useState(false)

    const { addButton, removeButton } = useToolbar()

    const confirmDelete = async () => {
        try {
            await apiService.deleteAnimal(Number(id))
            await queryClient.invalidateQueries(["animal-search"])
            apiService.showSuccess("Animale eliminato correttamente")
            navigate("/")
        } catch (error) {
            console.error("Failed to delete animal", error)
        }
    }

    const confirmMoveToShelter = async () => {
        if (!id || !moveToShelterDate) return

        try {
            setIsMovingToShelter(true)
            await apiService.moveAnimalToShelter(id, moveToShelterDate)

            // Show success message
            const animalName = props.data.name || "L'animale"
            apiService.showSuccess(
                `${animalName} è stato spostato in rifugio`,
                "Spostamento completato"
            )
            // Invalidate the query to refresh the data in the background
            queryClient.invalidateQueries(["animal", id])
            setMoveToShelterDialogVisible(false)
        } catch (error) {
            // Error is already handled by API service
            console.error("Failed to move animal to shelter:", error)
        } finally {
            setIsMovingToShelter(false)
        }
    }

    useEffect(() => {
        if (props.data.healthcare_stage && !props.data.exit_type) {
            addButton({
                id: "move-to-shelter",
                buttonText: "Sposta in rifugio",
                buttonIcon: faHouseCircleCheck,
                severity: "success",
                onClick: () => {
                    setMoveToShelterDate(new Date())
                    setMoveToShelterDialogVisible(true)
                },
            })
        }
        return () => removeButton("move-to-shelter")
    }, [
        props.data.healthcare_stage,
        props.data.exit_type,
        addButton,
        removeButton,
    ])

    useEffect(() => {
        if (isSuperUser) {
            addButton({
                id: "delete-animal",
                buttonText: "",
                buttonIcon: faTrash,
                severity: "danger",
                onClick: () => setDeleteDialogVisible(true),
            })
        }
        return () => {
            if (isSuperUser) removeButton("delete-animal")
        }
    }, [isSuperUser, addButton, removeButton])

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
        return () => removeButton("new-entry")
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

            <ConfirmDialog
                visible={deleteDialogVisible}
                onHide={() => setDeleteDialogVisible(false)}
                message="Sei sicuro di voler eliminare questo animale? Questa azione non può essere annullata."
                header="Conferma eliminazione"
                icon="pi pi-exclamation-triangle"
                accept={confirmDelete}
                reject={() => setDeleteDialogVisible(false)}
                acceptLabel="Elimina"
                rejectLabel="Annulla"
                acceptClassName="p-button-danger"
            />

            {/* Move to Shelter Dialog */}
            <Dialog
                header="Sposta in rifugio"
                visible={moveToShelterDialogVisible}
                style={{ width: "400px" }}
                onHide={() => setMoveToShelterDialogVisible(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Annulla"
                            icon="pi pi-times"
                            onClick={() => setMoveToShelterDialogVisible(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Conferma"
                            icon="pi pi-check"
                            onClick={confirmMoveToShelter}
                            loading={isMovingToShelter}
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4">
                    <p className="m-0">
                        Seleziona la data in cui l'animale è stato spostato in
                        rifugio:
                    </p>
                    <Calendar
                        value={moveToShelterDate}
                        onChange={(e) => setMoveToShelterDate(e.value as Date)}
                        showIcon
                        dateFormat="dd/mm/yy"
                        className="w-full"
                        maxDate={new Date()}
                    />
                </div>
            </Dialog>
        </div>
    )
}

export default AnimalRecord
