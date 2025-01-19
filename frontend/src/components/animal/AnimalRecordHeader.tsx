import {
    faHeart,
    faKitMedical,
    faTents,
    faTriangleExclamation,
    faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import { Menu } from "primereact/menu"
import { MenuItem } from "primereact/menuitem"
import { classNames } from "primereact/utils"
import { useRef } from "react"
import { Link } from "react-router-dom"
import cat from "../../assets/cat.svg"
import dog from "../../assets/dog.svg"
import { useExitTypesMap } from "../../hooks/useMaps"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "./misc"
type Props = {
    data: Animal
}

const ADOPTABILITY_FLAG_COLOR: { [key: number]: string } = {
    0: "#000000",
    1: "#FF0000",
    2: "#FFFF00",
}

const SanitarioBadge = () => (
    <span className="text-xs border px-2 py-1 border-red-500 bg-red-50 rounded">
        <FontAwesomeIcon icon={faKitMedical} /> Sanitario
    </span>
)

const RifugioBadge = () => (
    <span className="text-xs border px-2 py-1 border-green-700 bg-green-50 rounded">
        <FontAwesomeIcon icon={faTents} /> Rifugio
    </span>
)

const NotPresentInfo = (props: Props) => {
    const exitTypesMap = useExitTypesMap()
    const exitDate = new Date(props.data.exit_date!)
    const notPresent = exitDate < new Date()
    const title = notPresent ? "Non presente" : "In uscita"
    return (
        <div
            className={classNames("px-3 py-1 rounded", {
                "bg-red-200": notPresent,
                "bg-yellow-200": !notPresent,
            })}
        >
            <div className="flex flex-col">
                <div
                    className={classNames("flex gap-1 items-center", {
                        "text-red-600": notPresent,
                        "text-yellow-700": !notPresent,
                    })}
                >
                    <FontAwesomeIcon
                        icon={
                            notPresent ? faXmarkCircle : faTriangleExclamation
                        }
                    />
                    <span className="font-bold">{title}</span>
                </div>
                <div className="grid grid-cols-2 text-sm gap-x-1">
                    <span className="font-light">Data uscita</span>
                    <span className="font-bold">
                        {format(exitDate, "dd/MM/y")}
                    </span>
                    <span className="font-light">Motivo</span>
                    <span className="font-bold">
                        {exitTypesMap?.[props.data.exit_type!]}
                    </span>
                </div>
                <div className="flex gap-1 text-sm"></div>

                <div className="flex gap-1  text-sm"></div>
            </div>
        </div>
    )
}
const AnimalRecordHeader = (props: Props) => {
    const menuRef = useRef<Menu>(null)

    const menuItems: MenuItem[] = [
        {
            template: (item) => (
                <div className="p-menuitem-content">
                    <Link
                        to="adoption"
                        className="flex align-items-center p-menuitem-link"
                    >
                        <FontAwesomeIcon
                            className="text-red-500"
                            icon={faHeart}
                        />
                        <span className="mx-2 font-bold">Adozione</span>
                    </Link>
                </div>
            ),
        },
    ]
    const img_url = new URL(
        props.data.img_path || "",
        import.meta.env.VITE_ASSETS_BASE_URL
    )
    return (
        <div className="flex gap-4 items-start relative">
            <div
                className={classNames("w-28 h-28 rounded-full", {
                    border: !props.data.img_path,
                })}
            >
                <img
                    src={props.data.race_id == "C" ? dog : cat}
                    className={classNames("object-cover", {
                        "rounded-none m-8": !props.data.img_path,
                    })}
                />
            </div>
            <div className="grow">
                <div className="flex justify-between w-3/4 min-w-[480px]">
                    <div className="">
                        {props.data.adoptability_index && (
                            <div
                                className="inline-block rounded-full w-4 h-4"
                                style={{
                                    backgroundColor:
                                        ADOPTABILITY_FLAG_COLOR[
                                            props.data.adoptability_index
                                        ],
                                }}
                            />
                        )}
                        <h1
                            className={classNames("font-bold text-[2rem]", {
                                "text-gray-300": !props.data.name,
                            })}
                        >
                            {props.data.name || "Nome non assegnato"}
                        </h1>
                        <ChipCodeBadge
                            code={props.data.chip_code || undefined}
                        />
                    </div>
                    {props.data.exit_type && props.data.exit_date && (
                        <NotPresentInfo data={props.data} />
                    )}
                </div>
                {/* <RifugioBadge /> */}
            </div>
        </div>
    )
}

export default AnimalRecordHeader
