import { useParams } from "react-router-dom"
import { useAnimalQuery } from "../../queries"
import AnimalOverviewMessages from "./AnimalOverviewMessages"

type OverviewItemProps = {
    label: string
    value?: string
    content?: React.ReactNode
}
const OverviewItem = (props: OverviewItemProps) => (
    <div className="flex gap-2 items-center">
        <span className="text-xs ">{props.label}</span>
        {props.value && (
            <span className="text-[2rem] font-bold">{props.value}</span>
        )}
        {props.content}
    </div>
)
const AnimalOverview = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    return (
        <div>
            <AnimalOverviewMessages animal_id={id!} />
            <div>{/* <OverviewItem label="Età" value="3" /> */}</div>
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
