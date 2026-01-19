import {
    faKitMedical,
    faTents,
    faTriangleExclamation,
    faXmarkCircle,
    faCalendarAlt,
    faSignOutAlt,
    faCamera,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { classNames } from "primereact/utils"
import { useState } from "react"
import cat from "../../assets/cat.svg"
import dog from "../../assets/dog.svg"
import { useExitTypesMap } from "../../hooks/useMaps"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "./misc"
import AnimalImageUploadDialog from "./AnimalImageUploadDialog"

type Props = {
    data: Animal
}

const ADOPTABILITY_FLAG_COLOR: { [key: number]: string } = {
    0: "#6B7280", // gray-500
    1: "#EF4444", // red-500
    2: "#F59E0B", // amber-500
}

const NotPresentAlert = ({ data, bare }: { data: Animal; bare?: boolean }) => {
    const exitTypesMap = useExitTypesMap()
    const exitDate = new Date(data.exit_date!)
    const notPresent = exitDate < new Date()

    return (
        <div
            className={classNames("max-w-sm", {
                "px-4 py-3 rounded-lg border-l-4 shadow-sm": !bare,
                "bg-surface-100 border-surface-400": !bare && notPresent,
                "bg-amber-50 border-amber-400": !bare && !notPresent,
            })}
        >
            <div className="flex items-start gap-3">
                <div
                    className={classNames("flex-shrink-0 mt-0.5", {
                        "text-surface-500": notPresent,
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
                            "text-surface-700": notPresent,
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
                                className={classNames("w-3 h-3", {
                                    "text-surface-400": notPresent,
                                    "text-surface-500": !notPresent,
                                })}
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
                                className={classNames("w-3 h-3", {
                                    "text-surface-400": notPresent,
                                    "text-surface-500": !notPresent,
                                })}
                            />
                            <span className="text-surface-700">
                                <span className="font-medium">Motivo:</span>{" "}
                                {exitTypesMap?.[data.exit_type!]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StageInfo = ({
    healthcareStage,
    inShelterFrom,
    bare,
}: {
    healthcareStage?: boolean
    inShelterFrom?: Date | null
    bare?: boolean
}) => {
    const isInShelter = !healthcareStage

    return (
        <div
            className={classNames("max-w-sm", {
                "px-4 py-3 rounded-lg border-l-4 shadow-sm": !bare,
                "bg-green-50 border-green-400": !bare && isInShelter,
                "bg-red-50 border-red-400": !bare && !isInShelter,
            })}
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

    const handleImageClick = () => {
        setImageUploadDialogVisible(true)
    }

    const exitDate = props.data.exit_date
        ? new Date(props.data.exit_date)
        : null
    const isNotPresent = exitDate && exitDate < new Date()
    const isSanitary =
        !isNotPresent && !props.data.exit_type && !!props.data.healthcare_stage

    return (
        <div
            className={classNames("rounded-xl shadow-sm border p-6 mb-6", {
                "bg-surface-100 border-surface-300": isNotPresent,
                "bg-red-50 border-red-200": isSanitary,
                "bg-white border-surface-200": !isNotPresent && !isSanitary,
            })}
        >
            <div className="flex gap-6 items-start">
                {/* Animal Image */}
                <div className="flex-shrink-0">
                    <div
                        className={classNames(
                            "w-32 h-32 rounded-full border-4 border-surface-100 overflow-hidden bg-surface-50 flex items-center justify-center relative group cursor-pointer transition-all duration-200 hover:border-surface-300",
                            { grayscale: isNotPresent }
                        )}
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
                                <NotPresentAlert
                                    data={props.data}
                                    bare={!!isNotPresent}
                                />
                            </div>
                        )}

                        {/* Stage Info - Show when animal is present */}
                        {!props.data.exit_type && (
                            <div className="lg:flex-shrink-0">
                                <StageInfo
                                    healthcareStage={
                                        props.data.healthcare_stage
                                    }
                                    inShelterFrom={props.data.in_shelter_from}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
