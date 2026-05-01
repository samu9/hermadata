import { faCircleInfo, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAnimalQuery } from "../../queries"
import AnimalCompleteEntryForm from "./AnimalCompleteEntryForm"
import { toastService } from "../../services/toast"

type BannerProps = {
    variant: "warning" | "info"
    title: string
    detail?: string
    children?: React.ReactNode
}

const Banner = ({ variant, title, detail, children }: BannerProps) => {
    const isWarning = variant === "warning"
    return (
        <div
            className={`flex gap-3 rounded-lg px-4 py-3 border ${
                isWarning
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
        >
            <FontAwesomeIcon
                icon={isWarning ? faTriangleExclamation : faCircleInfo}
                className={`mt-0.5 shrink-0 ${isWarning ? "text-amber-500" : "text-blue-500"}`}
            />
            <div className="flex flex-col gap-2 min-w-0 flex-1">
                <span className="font-semibold text-sm">{title}</span>
                {detail && <p className="text-sm opacity-80">{detail}</p>}
                {children}
            </div>
        </div>
    )
}

type Props = {
    animal_id: string
}

const AnimalOverviewMessages = ({ animal_id }: Props) => {
    const animalQuery = useAnimalQuery(animal_id)
    const data = animalQuery.data

    if (!data) return null

    const showCompleteEntry = !data.entry_date
    const showMissingChip = !data.chip_code && !data.without_chip
    const showWithoutChip = !data.chip_code && data.without_chip

    if (!showCompleteEntry && !showMissingChip && !showWithoutChip) return null

    return (
        <div className="flex flex-col gap-2">
            {showCompleteEntry && (
                <Banner variant="warning" title="Completa l'ingresso">
                    <AnimalCompleteEntryForm
                        animal_id={animal_id}
                        onComplete={() =>
                            toastService.showSuccess("Ingresso completato")
                        }
                    />
                </Banner>
            )}
            {showMissingChip && (
                <Banner
                    variant="warning"
                    title="Dati chip mancanti"
                    detail="L'animale ha un chip ma il codice non è stato inserito"
                />
            )}
            {showWithoutChip && (
                <Banner
                    variant="info"
                    title="Senza chip"
                    detail="L'animale è stato registrato come sprovvisto di microchip"
                />
            )}
        </div>
    )
}

export default AnimalOverviewMessages
