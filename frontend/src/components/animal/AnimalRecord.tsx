import { Animal } from "../../models/animal.schema"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFile,
    faHome,
    faList,
    faPencil,
} from "@fortawesome/free-solid-svg-icons"
import { TabMenu } from "primereact/tabmenu"
import { MenuItem } from "primereact/menuitem"
import { Outlet, useNavigate } from "react-router-dom"
import AnimalRecordHeader from "./AnimalRecordHeader"

type Props = {
    data: Animal
}

const AnimalRecord = (props: Props) => {
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
        {
            label: "Modifica",
            icon: (
                <FontAwesomeIcon icon={faPencil} fixedWidth className="px-1" />
            ),
            command: () => navigate("edit", { state: props.data }),
        },
    ]
    return (
        <div>
            <div className="mb-4">
                <AnimalRecordHeader data={props.data} />
            </div>
            <TabMenu model={tabMenuItems} />
            <div className="py-4">
                <Outlet />
            </div>
        </div>
    )
}

export default AnimalRecord
