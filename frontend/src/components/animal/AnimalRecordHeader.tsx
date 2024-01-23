import {
    faBars,
    faHeart,
    faKitMedical,
    faTents,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { Menu } from "primereact/menu"
import { MenuItem } from "primereact/menuitem"
import { classNames } from "primereact/utils"
import { useRef } from "react"
import { Link } from "react-router-dom"
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
        <div className="flex gap-4 items-end relative">
            <img
                src="https://www.idyll-by-the-sea.com/one/images/P0003391.jpg" //{img_url.toString()}
                className="rounded-full w-40 h-40 object-cover"
            />
            <div className="grow">
                <div className="absolute right-4 top-4">
                    <Button
                        severity="secondary"
                        outlined
                        onClick={(e) => menuRef.current?.toggle(e)}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </Button>
                    <Menu
                        model={menuItems}
                        popup
                        ref={menuRef}
                        id="popup_menu"
                        popupAlignment="right"
                    />
                </div>
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
                <ChipCodeBadge code={props.data.chip_code} />
                {/* <SanitarioBadge /> */}
                <RifugioBadge />
            </div>
        </div>
    )
}

export default AnimalRecordHeader
