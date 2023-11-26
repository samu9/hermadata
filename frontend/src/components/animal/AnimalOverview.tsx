import { faMapPin, faWarning } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"

const AnimalOverview = () => {
    return (
        <div>
            <div className="w-full text-center">
                <Button severity="warning" outlined raised>
                    <FontAwesomeIcon icon={faWarning} /> Completa ingresso
                </Button>
            </div>

            {/* <div>
                    <FontAwesomeIcon icon={faMapPin} /> {props.data.rescue_city}{" "}
                    ({props.data.rescue_province})
                </div>
                <div>
                    <div className="text-xs text-gray-700">Ingresso </div>

                    <div className="font-bold">
                        {(props.data.entry_date &&
                            format(props.data.entry_date, "dd/MM/y")) ||
                            "-"}
                    </div>
                </div> */}
        </div>
    )
}

export default AnimalOverview
