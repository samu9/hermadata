import { Animal } from "../../models/animal.schema"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCross,
    faFile,
    faFilePdf,
    faHome,
    faKitMedical,
    faList,
    faMapPin,
    faTents,
} from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"
import { Accordion, AccordionTab } from "primereact/accordion"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { TabMenu } from "primereact/tabmenu"
import { MenuItem } from "primereact/menuitem"
import { Outlet, useNavigate } from "react-router-dom"
import { Chip } from "primereact/chip"

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
const DossierHeader = (props: Props) => (
    <div className="flex gap-4">
        <img
            src="https://www.105.net/resizer/1000/683/true/43-1681218444492.jpg--citta_inglese_tenuta_sotto_controllo_da_due_chihuahua.jpg?1681218444516"
            className="rounded-full w-40 h-40 object-cover"
        />
        <div>
            <div className="flex items-center gap-1">
                <div
                    className="inline-block rounded-full w-4 h-4"
                    style={{
                        backgroundColor:
                            ADOPTABILITY_FLAG_COLOR[
                                props.data.adoptability_index
                            ],
                    }}
                />
                <h1
                    className="text-primary font-bold text-primary"
                    style={{
                        fontSize: "2rem",
                        // color: "var(--primary-color)",
                    }}
                >
                    {props.data.name}
                </h1>
            </div>
            <SanitarioBadge /> <RifugioBadge />
            <div>
                <FontAwesomeIcon icon={faMapPin} /> {props.data.rescue_city} (
                {props.data.rescue_province})
            </div>
            <div>
                <div className="text-xs text-gray-700">Ingresso </div>

                <div className="font-bold">
                    {(props.data.entry_date &&
                        format(props.data.entry_date, "dd/MM/y")) ||
                        "-"}
                </div>
            </div>
        </div>
    </div>
)

const AnimalDossier = (props: Props) => {
    const navigate = useNavigate()
    const tabMenuItems: MenuItem[] = [
        {
            label: "Panoramica",
            icon: <FontAwesomeIcon icon={faHome} fixedWidth className="px-1" />,
            command: (e) => navigate(""),
        },
        {
            label: "Documenti",
            icon: <FontAwesomeIcon icon={faFile} fixedWidth className="px-1" />,
            command: (e) => navigate("docs"),
        },
        {
            label: "Eventi",
            icon: <FontAwesomeIcon icon={faList} fixedWidth className="px-1" />,
        },
    ]
    return (
        <div>
            <div className="mb-4">
                <DossierHeader data={props.data} />
            </div>
            <TabMenu model={tabMenuItems} />
            <div className="py-4">
                <Outlet />
            </div>
        </div>
    )
}

export default AnimalDossier
