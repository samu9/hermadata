import { ComuneSchema } from "../../../models/city.schema"

/** A comune suggestion: name, a star if favourite, and the provincia. */
const ComuneItem = ({ comune }: { comune: ComuneSchema }) => (
    <div className="flex justify-between gap-3">
        <span>
            {comune.name}
            {comune.favourite && (
                <i
                    className="pi pi-star-fill text-amber-500 text-xs ml-2"
                    title="Comune preferito"
                    aria-label="Comune preferito"
                />
            )}
        </span>
        <span className="text-surface-400">{comune.provincia}</span>
    </div>
)

export default ComuneItem
