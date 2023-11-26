import { Animal } from "../../models/animal.schema"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faKitMedical, faTents } from "@fortawesome/free-solid-svg-icons"
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
    return (
        <div className="flex gap-4 items-end">
            <img
                src="https://www.105.net/resizer/1000/683/true/43-1681218444492.jpg--citta_inglese_tenuta_sotto_controllo_da_due_chihuahua.jpg?1681218444516"
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
                <SanitarioBadge /> <RifugioBadge />
            </div>
        </div>
    )
}

export default AnimalRecordHeader
