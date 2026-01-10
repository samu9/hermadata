import {
    faKitMedical,
    faTents,
    faTriangleExclamation,
    faXmarkCircle,
    faCalendarAlt,
    faSignOutAlt,
    faCamera,
    faHouseCircleCheck,
    faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { classNames } from "primereact/utils"
import { useState, useEffect } from "react"
import cat from "../../assets/cat.svg"
import dog from "../../assets/dog.svg"
import { useExitTypesMap } from "../../hooks/useMaps"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "./misc"
import AnimalImageUploadDialog from "./AnimalImageUploadDialog"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Calendar } from "primereact/calendar"
import { apiService } from "../../main"
import { useQueryClient } from "react-query"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { ConfirmDialog } from "primereact/confirmdialog"

type Props = {
    data: Animal
}

const ADOPTABILITY_FLAG_COLOR: { [key: number]: string } = {
    0: "#6B7280", // gray-500
    1: "#EF4444", // red-500
    2: "#F59E0B", // amber-500
}

const NotPresentAlert = (props: Props) => {
    const exitTypesMap = useExitTypesMap()
    const exitDate = new Date(props.data.exit_date!)
    const notPresent = exitDate < new Date()

    return (
        <div
            className={classNames(
                "px-4 py-3 rounded-lg border-l-4 shadow-sm max-w-sm",
                {
                    "bg-red-50 border-red-400": notPresent,
                    "bg-amber-50 border-amber-400": !notPresent,
                }
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={classNames("flex-shrink-0 mt-0.5", {
                        "text-red-500": notPresent,
                        "text-amber-500": !notPresent,
                    })}
                >
                    <FontAwesomeIcon
                        icon={
                            notPresent ? faXmarkCircle : faTriangleExclamation
                        }
                        className="w-4 h-4"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3
                        className={classNames("text-sm font-semibold", {
                            "text-red-800": notPresent,
                            "text-amber-800": !notPresent,
                        })}
                    >
                        {notPresent
                            ? "Animale non presente"
                            : "Animale in uscita"}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="w-3 h-3 text-surface-500"
                            />
                            <span className="text-surface-700">
                                <span className="font-medium">
                                    Data uscita:
                                </span>{" "}
                                {format(exitDate, "dd/MM/yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={faSignOutAlt}
                                className="w-3 h-3 text-surface-500"
                            />
                            <span className="text-surface-700">
                                <span className="font-medium">Motivo:</span>{" "}
                                {exitTypesMap?.[props.data.exit_type!]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StageInfo = (props: {
    healthcareStage?: boolean
    inShelterFrom?: Date | null
}) => {
    const isInShelter = !props.healthcareStage
    const inShelterFrom = props.inShelterFrom

    if (!isInShelter && !props.healthcareStage) {
        return null
    }

    return (
        <div
            className={classNames(
                "px-4 py-3 rounded-lg border-l-4 shadow-sm max-w-sm",
                {
                    "bg-green-50 border-green-400": isInShelter,
                    "bg-red-50 border-red-400": !isInShelter,
                }
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={classNames("flex-shrink-0 mt-0.5", {
                        "text-green-600": isInShelter,
                        "text-red-600": !isInShelter,
                    })}
                >
                    <FontAwesomeIcon
                        icon={isInShelter ? faTents : faKitMedical}
                        className="w-4 h-4"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3
                        className={classNames("text-sm font-semibold", {
                            "text-green-800": isInShelter,
                            "text-red-800": !isInShelter,
                        })}
                    >
                        {isInShelter ? "In rifugio" : "In sanitario"}
                    </h3>
                    {isInShelter && inShelterFrom && (
                        <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="w-3 h-3 text-surface-500"
                                />
                                <span className="text-surface-700">
                                    <span className="font-medium">Dal:</span>{" "}
                                    {format(
                                        new Date(inShelterFrom),
                                        "dd/MM/yyyy"
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const AnimalRecordHeader = (props: Props) => {
    const [imageUploadDialogVisible, setImageUploadDialogVisible] =
        useState(false)
    const [isMovingToShelter, setIsMovingToShelter] = useState(false)
    const [moveToShelterDialogVisible, setMoveToShelterDialogVisible] =
        useState(false)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)

    const [moveToShelterDate, setMoveToShelterDate] = useState<Date | null>(
        new Date()
    )
    const [currentHealthcareStage, setCurrentHealthcareStage] = useState(
        props.data.healthcare_stage
    )
    const [currentInShelterFrom, setCurrentInShelterFrom] = useState(
        props.data.in_shelter_from
    )
    const queryClient = useQueryClient()
    const { id: animalId } = useParams<{ id: string }>()
    const { isSuperUser } = useAuth()
    const navigate = useNavigate()

    // Sync local state with props when data changes
    useEffect(() => {
        setCurrentHealthcareStage(props.data.healthcare_stage)
        setCurrentInShelterFrom(props.data.in_shelter_from)
    }, [props.data.healthcare_stage, props.data.in_shelter_from])

    const handleImageClick = () => {
        setImageUploadDialogVisible(true)
    }

    const handleDeleteClick = () => {
        setDeleteDialogVisible(true)
    }

    const confirmDelete = async () => {
        try {
            await apiService.deleteAnimal(Number(animalId))
            await queryClient.invalidateQueries(["animal-search"])
            apiService.showSuccess("Animale eliminato correttamente")
            navigate("/animal")
        } catch (error) {
            console.error("Failed to delete animal", error)
        }
    }

    const handleMoveToShelterClick = () => {
        setMoveToShelterDate(new Date())
        setMoveToShelterDialogVisible(true)
    }

    const confirmMoveToShelter = async () => {
        if (!animalId || !moveToShelterDate) return

        try {
            setIsMovingToShelter(true)
            await apiService.moveAnimalToShelter(animalId, moveToShelterDate)
            // Update local state immediately for instant UI feedback
            setCurrentHealthcareStage(false)
            setCurrentInShelterFrom(moveToShelterDate)
            // Show success message
            const animalName = props.data.name || "L'animale"
            apiService.showSuccess(
                `${animalName} è stato spostato in rifugio`,
                "Spostamento completato"
            )
            // Invalidate the query to refresh the data in the background
            queryClient.invalidateQueries(["animal", animalId])
            setMoveToShelterDialogVisible(false)
        } catch (error) {
            // Error is already handled by API service
            console.error("Failed to move animal to shelter:", error)
        } finally {
            setIsMovingToShelter(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-6">
            <div className="flex gap-6 items-start">
                {/* Animal Image */}
                <div className="flex-shrink-0">
                    <div
                        className="w-32 h-32 rounded-full border-4 border-surface-100 overflow-hidden bg-surface-50 flex items-center justify-center relative group cursor-pointer transition-all duration-200 hover:border-surface-300"
                        onClick={handleImageClick}
                        title="Clicca per cambiare l'immagine"
                    >
                        <img
                            src={
                                props.data.img_path ||
                                (props.data.race_id === "C" ? dog : cat)
                            }
                            alt="Animal"
                            className={classNames(
                                "w-full h-full object-cover transition-all duration-200 group-hover:brightness-75",
                                {
                                    "w-12 h-12 object-cover":
                                        !props.data.img_path,
                                }
                            )}
                        />
                        {/* Overlay with camera icon on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FontAwesomeIcon
                                icon={faCamera}
                                className="text-white text-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Animal Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {/* Adoptability Flag */}
                                {props.data.adoptability_index !== null &&
                                    props.data.adoptability_index !==
                                        undefined && (
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                            style={{
                                                backgroundColor:
                                                    ADOPTABILITY_FLAG_COLOR[
                                                        props.data
                                                            .adoptability_index
                                                    ] || "#gray",
                                            }}
                                            title={`Indice adottabilità: ${props.data.adoptability_index}`}
                                        />
                                    )}

                                {/* Stage Badge */}
                                {props.data.stage === "S" && (
                                    <span className="text-xs px-2 py-1 border border-green-600 bg-green-50 text-green-700 rounded-md font-medium">
                                        <FontAwesomeIcon
                                            icon={faTents}
                                            className="mr-1"
                                        />
                                        Rifugio
                                    </span>
                                )}
                                {props.data.stage === "H" && (
                                    <span className="text-xs px-2 py-1 border border-red-500 bg-red-50 text-red-700 rounded-md font-medium">
                                        <FontAwesomeIcon
                                            icon={faKitMedical}
                                            className="mr-1"
                                        />
                                        Sanitario
                                    </span>
                                )}
                            </div>

                            <h1
                                className={classNames(
                                    "text-3xl font-bold mb-3 leading-tight",
                                    {
                                        "text-surface-900": props.data.name,
                                        "text-surface-400": !props.data.name,
                                    }
                                )}
                            >
                                {props.data.name || "Nome non assegnato"}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4">
                                <ChipCodeBadge
                                    code={props.data.chip_code || undefined}
                                />
                                <div className="text-sm text-surface-600">
                                    <span className="font-medium">Codice:</span>{" "}
                                    {props.data.code}
                                </div>
                            </div>
                        </div>

                        {/* Alert for Not Present Animals */}
                        {props.data.exit_type && props.data.exit_date && (
                            <div className="lg:flex-shrink-0">
                                <NotPresentAlert data={props.data} />
                            </div>
                        )}

                        {/* Stage Info - Show when animal is present */}
                        {!props.data.exit_type && (
                            <div className="lg:flex-shrink-0">
                                <StageInfo
                                    healthcareStage={currentHealthcareStage}
                                    inShelterFrom={currentInShelterFrom}
                                />
                            </div>
                        )}

                        {/* Move to Shelter Button */}
                        <div className="flex flex-col gap-2">
                            {currentHealthcareStage &&
                                !props.data.exit_type && (
                                    <div className="lg:flex-shrink-0">
                                        <Button
                                            label="Sposta in rifugio"
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faHouseCircleCheck}
                                                    className="mr-2"
                                                />
                                            }
                                            onClick={handleMoveToShelterClick}
                                            loading={isMovingToShelter}
                                            className="!bg-green-600 !border-green-600 hover:!bg-green-700 !text-white w-full"
                                        />
                                    </div>
                                )}

                            {isSuperUser && (
                                <div className="lg:flex-shrink-0">
                                    <Button
                                        label="Elimina animale"
                                        icon="pi pi-trash"
                                        severity="danger"
                                        onClick={handleDeleteClick}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                visible={deleteDialogVisible}
                onHide={() => setDeleteDialogVisible(false)}
                message="Sei sicuro di voler eliminare questo animale? L'azione non può essere annullata."
                header="Conferma eliminazione"
                icon="pi pi-exclamation-triangle"
                accept={confirmDelete}
                reject={() => setDeleteDialogVisible(false)}
                acceptClassName="p-button-danger"
                acceptLabel="Elimina"
                rejectLabel="Annulla"
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

            {/* Image Upload Dialog */}
            <AnimalImageUploadDialog
                visible={imageUploadDialogVisible}
                onHide={() => setImageUploadDialogVisible(false)}
                animalId={props.data.code}
                animalName={props.data.name || undefined}
            />
        </div>
    )
}

export default AnimalRecordHeader
