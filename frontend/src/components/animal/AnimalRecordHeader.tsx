import {
    faKitMedical,
    faTents,
    faTriangleExclamation,
    faXmarkCircle,
    faCalendarAlt,
    faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { classNames } from "primereact/utils"
import cat from "../../assets/cat.svg"
import dog from "../../assets/dog.svg"
import { useExitTypesMap } from "../../hooks/useMaps"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "./misc"
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
                                className="w-3 h-3 text-gray-500"
                            />
                            <span className="text-gray-700">
                                <span className="font-medium">
                                    Data uscita:
                                </span>{" "}
                                {format(exitDate, "dd/MM/yyyy")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={faSignOutAlt}
                                className="w-3 h-3 text-gray-500"
                            />
                            <span className="text-gray-700">
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
const AnimalRecordHeader = (props: Props) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex gap-6 items-start">
                {/* Animal Image */}
                <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img
                            src={props.data.race_id === "C" ? dog : cat}
                            alt="Animal"
                            className={classNames(
                                "w-full h-full object-cover",
                                {
                                    "w-16 h-16": !props.data.img_path,
                                }
                            )}
                        />
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
                                        "text-gray-800": props.data.name,
                                        "text-gray-400": !props.data.name,
                                    }
                                )}
                            >
                                {props.data.name || "Nome non assegnato"}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4">
                                <ChipCodeBadge
                                    code={props.data.chip_code || undefined}
                                />
                                <div className="text-sm text-gray-600">
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnimalRecordHeader
