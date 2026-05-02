import {
    faKitMedical,
    faTents,
    faTriangleExclamation,
    faXmarkCircle,
    faCalendarAlt,
    faSignOutAlt,
    faCamera,
    faBuilding,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { classNames } from "primereact/utils"
import { useState, useMemo } from "react"
import cat from "../../assets/cat.svg"
import dog from "../../assets/dog.svg"
import { useExitTypesMap } from "../../hooks/useMaps"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "./misc"
import AnimalImageUploadDialog from "./AnimalImageUploadDialog"
import { useStructuresQuery } from "../../queries"
import { apiService } from "../../main"
import { useParams } from "react-router-dom"

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
                "px-4 py-3 rounded-lg": !bare,
                "bg-surface-100": !bare && notPresent,
                "bg-amber-50": !bare && !notPresent,
            })}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={
                            notPresent ? faXmarkCircle : faTriangleExclamation
                        }
                        className={classNames("w-4 h-4 flex-shrink-0", {
                            "text-surface-500": notPresent,
                            "text-amber-500": !notPresent,
                        })}
                    />
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
                </div>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className={classNames("w-3 h-3", {
                                "text-surface-400": notPresent,
                                "text-surface-500": !notPresent,
                            })}
                        />
                        <span className="text-surface-700">
                            <span className="font-medium">Data uscita:</span>{" "}
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
                "px-4 py-3 rounded-lg": !bare && !isInShelter,
                "bg-red-50": !bare && !isInShelter,
            })}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={isInShelter ? faTents : faKitMedical}
                        className={classNames("w-4 h-4 flex-shrink-0", {
                            "text-primary-600": isInShelter,
                            "text-red-600": !isInShelter,
                        })}
                    />
                    <h3
                        className={classNames("text-sm font-semibold", {
                            "text-primary-700": isInShelter,
                            "text-red-800": !isInShelter,
                        })}
                    >
                        {isInShelter ? "In rifugio" : "In sanitario"}
                    </h3>
                </div>
                {isInShelter && inShelterFrom && (
                    <div className="flex items-center gap-2 text-xs">
                        <FontAwesomeIcon
                            icon={faCalendarAlt}
                            className="w-3 h-3 text-surface-500"
                        />
                        <span className="text-surface-700">
                            <span className="font-medium">Dal:</span>{" "}
                            {format(new Date(inShelterFrom), "dd/MM/yyyy")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

const AnimalRecordHeader = (props: Props) => {
    const { id: animalId } = useParams()
    const [imageUploadDialogVisible, setImageUploadDialogVisible] =
        useState(false)
    const structuresQuery = useStructuresQuery()
    const structureName = structuresQuery.data?.find(
        (s) => s.id === props.data.structure_id,
    )?.name

    const profileImageUrl =
        animalId && props.data.profile_image_id
            ? apiService.getAnimalImageUrl(
                  Number(animalId),
                  props.data.profile_image_id,
              )
            : null

    const rotation = useMemo(() => {
        const options = [-4, -3, -2, 2, 3, 4]
        return options[Math.floor(Math.random() * options.length)]
    }, [])

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
        <div className="relative mb-6 mt-4">
            {/* Polaroid — top nearly flush with card top border */}
            <div
                className="absolute -top-1 left-6 z-10"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div
                    className={classNames(
                        "bg-white p-1.5 pb-6 shadow-xl rounded-sm w-32 group cursor-pointer",
                        { grayscale: isNotPresent },
                    )}
                    onClick={handleImageClick}
                    title="Clicca per cambiare l'immagine"
                >
                    <div className="w-full aspect-square overflow-hidden bg-surface-100 flex items-center justify-center relative">
                        <img
                            src={
                                profileImageUrl ||
                                (props.data.race_id === "C" ? dog : cat)
                            }
                            alt="Animal"
                            className={classNames(
                                "transition-all duration-200 group-hover:brightness-75",
                                profileImageUrl
                                    ? "w-full h-full object-cover"
                                    : "w-16 h-16 object-contain opacity-30",
                            )}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <FontAwesomeIcon
                                icon={faCamera}
                                className="text-white text-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card */}
            <div
                className={classNames(
                    "rounded-xl shadow-sm border pt-6 pb-6 pr-6 pl-44",
                    {
                        "bg-surface-100 border-surface-300": isNotPresent,
                        "bg-red-50 border-red-200": isSanitary,
                        "bg-primary-50 border-primary-200":
                            !isNotPresent && !isSanitary,
                    },
                )}
            >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Animal Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Adoptability Flag */}
                            {props.data.adoptability_index !== null &&
                                props.data.adoptability_index !== undefined && (
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
                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                    <FontAwesomeIcon icon={faTents} />
                                    Rifugio
                                </span>
                            )}
                            {props.data.stage === "H" && (
                                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                                    <FontAwesomeIcon icon={faKitMedical} />
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
                                },
                            )}
                        >
                            {props.data.name || "Nome non assegnato"}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4">
                            <ChipCodeBadge
                                code={props.data.chip_code || undefined}
                            />
                            {structureName && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    <FontAwesomeIcon
                                        icon={faBuilding}
                                        className="w-3 h-3"
                                    />
                                    {structureName}
                                </span>
                            )}
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
                                healthcareStage={props.data.healthcare_stage}
                                inShelterFrom={props.data.in_shelter_from}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Image Upload Dialog */}
            {animalId && (
                <AnimalImageUploadDialog
                    visible={imageUploadDialogVisible}
                    onHide={() => setImageUploadDialogVisible(false)}
                    animalId={Number(animalId)}
                    animalName={props.data.name || undefined}
                />
            )}
        </div>
    )
}

export default AnimalRecordHeader
