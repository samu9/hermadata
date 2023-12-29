import { Animal } from "../../models/animal.schema"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faKitMedical,
    faMicrochip,
    faTents,
} from "@fortawesome/free-solid-svg-icons"
import { classNames } from "primereact/utils"

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
const AnimalRecordHeader = (props: Props) => {
    const img_url = new URL(
        props.data.img_path || "",
        import.meta.env.VITE_ASSETS_BASE_URL
    )
    return (
        <div className="flex gap-4 items-end">
            <img
                src="https://www.idyll-by-the-sea.com/one/images/P0003391.jpg" //{img_url.toString()}
                className="rounded-full w-40 h-40 object-cover"
            />
            <div className="grow">
                <div className="flex items-center gap-1">
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
                </div>
                <div
                    className={classNames("text-sm flex gap-1 items-center", {
                        "text-gray-300": !props.data.chip_code,
                        "font-mono mb-2": props.data.chip_code,
                    })}
                >
                    <FontAwesomeIcon icon={faMicrochip} />
                    <span>{props.data.chip_code || "Chip non assegnato"}</span>
                </div>
                {/* <SanitarioBadge /> */}
                <RifugioBadge />
            </div>
        </div>
    )
}

export default AnimalRecordHeader
