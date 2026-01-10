import { format } from "date-fns"
import { Animal } from "../../models/animal.schema"
import { ChipCodeBadge } from "../animal/misc"

type Props = {
    data: Animal
}

const AnimalCard = (props: Props) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-4 flex gap-4 items-center">
            <div className="w-16 h-16 rounded-lg bg-surface-100 flex items-center justify-center text-surface-400">
                {/* Placeholder for image if not present, or actual image */}
                <i className="pi pi-image text-2xl"></i>
            </div>
            <div>
                <div className="text-xl font-bold text-surface-900 mb-1">
                    {props.data.name || "Nome non assegnato"}
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <ChipCodeBadge code={props.data.chip_code ?? undefined} />
                </div>
                {props.data.entry_date && (
                    <div className="text-sm text-surface-600">
                        entrato il{" "}
                        <span className="font-semibold text-surface-900">
                            {format(new Date(props.data.entry_date), "dd/MM/y")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AnimalCard
