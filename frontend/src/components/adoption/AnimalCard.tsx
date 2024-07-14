import { format } from "date-fns"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "../animal/misc"

type Props = {
    data: Animal
}

const AnimalCard = (props: Props) => {
    return (
        <div className="p-4 shadow rounded card flex gap-4">
            <img className="w-16 h-16 rounded" />
            <div>
                <span className="text-xl font-bold text-gray-600">
                    {props.data.name || "Nome non assegnato"}
                </span>
                <ChipCodeBadge code={props.data.chip_code ?? undefined} />
                {props.data.entry_date && (
                    <span className="text-sm">
                        entrato il{" "}
                        <span className="font-bold">
                            {format(new Date(props.data.entry_date), "dd/MM/y")}
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}

export default AnimalCard
