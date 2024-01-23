import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Adopter } from "../../models/adopter.schema"
import { faPhone, faUser } from "@fortawesome/free-solid-svg-icons"

const AdopterCard = (props: { data: Adopter }) => {
    return (
        <div className="px-4 py-2 shadow rounded card flex gap-4 items-center">
            <FontAwesomeIcon
                icon={faUser}
                className="text-[2rem] w-16"
                fixedWidth
            />
            <div className="flex flex-col text-gray-500 gap-1">
                <span className="text-xl font-bold text-gray-600">
                    {props.data.name} {props.data.surname}
                </span>
                <div className="text-xs flex gap-1 items-center">
                    <span className="text-sm">{props.data.fiscal_code}</span>
                </div>

                <div className="text-xs flex gap-1 items-center">
                    <FontAwesomeIcon icon={faPhone} />
                    <span className="text-sm">{props.data.phone}</span>
                </div>
            </div>
        </div>
    )
}

export default AdopterCard
