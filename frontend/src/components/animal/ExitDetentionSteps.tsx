import {
    faAdd,
    faCheck,
    faLock,
    faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "primereact/button"
import { ReactNode, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Adopter } from "../../models/adopter.schema"
import { AnimalExit } from "../../models/animal.schema"
import NewAdopterForm from "../adopter/NewAdopterForm"
import AdopterCard from "../adoption/AdopterCard"
import SearchAdopter from "../adoption/SearchAdopter"
import ControlledCityPicker from "../forms/city/ControlledCityPicker"
import ControlledInputText from "../forms/ControlledInputText"

type StepProps = {
    number: number
    title: string
    done: boolean
    locked?: boolean
    children: ReactNode
}

const Step = ({ number, title, done, locked, children }: StepProps) => (
    <section
        className={`rounded-lg shadow p-6 border ${
            locked
                ? "bg-surface-50 border-surface-200"
                : "bg-blue-50 border-blue-200"
        }`}
        aria-disabled={locked}
    >
        <h3
            className={`flex items-center gap-3 text-lg font-semibold mb-4 ${
                locked ? "text-surface-400" : "text-blue-900"
            }`}
        >
            <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                    done
                        ? "bg-green-600 text-white"
                        : locked
                          ? "bg-surface-200 text-surface-500"
                          : "bg-blue-600 text-white"
                }`}
            >
                {done ? <FontAwesomeIcon icon={faCheck} /> : number}
            </span>
            {title}
        </h3>
        {children}
    </section>
)

type Props = {
    selectedAdopter: Adopter | null
    onAdopterSelected: (adopter: Adopter | null) => void
}

/**
 * Guided adopter → detention flow of the exit form. The adopter is picked
 * (or created) first; only then the detention location unlocks. The adopter
 * search and creation forms are not nested in the exit form, so their
 * submits can't reach it, and the detention values stay in the exit form
 * state even when the adopter is changed afterwards.
 */
const ExitDetentionSteps = ({ selectedAdopter, onAdopterSelected }: Props) => {
    const { watch } = useFormContext<AnimalExit>()
    const [adopterAction, setAdopterAction] = useState<"search" | "new">(
        "search",
    )

    const adopterId = watch("adopter_id")
    const locationAddress = watch("location_address")
    const locationCityCode = watch("location_city_code")
    const hasAdopter = !!adopterId
    const hasLocation = !!locationAddress && !!locationCityCode

    return (
        <>
            <Step number={1} title="Adottante" done={hasAdopter}>
                {selectedAdopter ? (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-green-800 font-medium text-sm">
                                ✓ Adottante Selezionato
                            </span>
                            <Button
                                type="button"
                                onClick={() => onAdopterSelected(null)}
                                text
                                severity="secondary"
                                size="small"
                                className="text-xs"
                            >
                                Cambia
                            </Button>
                        </div>
                        <AdopterCard data={selectedAdopter} variant="selected" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="button"
                                onClick={() => setAdopterAction("search")}
                                outlined={adopterAction !== "search"}
                                severity={
                                    adopterAction === "search"
                                        ? "info"
                                        : "secondary"
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="mr-2"
                                />
                                Cerca Adottante
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setAdopterAction("new")}
                                outlined={adopterAction !== "new"}
                                severity={
                                    adopterAction === "new"
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                                Nuovo Adottante
                            </Button>
                        </div>
                        <div className="bg-white p-4 border border-gray-200 rounded-lg">
                            {adopterAction === "search" ? (
                                <SearchAdopter
                                    onSelected={onAdopterSelected}
                                    onNoResultsCallback={() => null}
                                />
                            ) : (
                                <NewAdopterForm onSaved={onAdopterSelected} />
                            )}
                        </div>
                    </div>
                )}
            </Step>

            <Step
                number={2}
                title="Luogo di detenzione"
                done={hasAdopter && hasLocation}
                locked={!hasAdopter}
            >
                {hasAdopter ? (
                    <div className="space-y-4">
                        <ControlledInputText
                            label="Indirizzo di detenzione"
                            fieldName="location_address"
                            className="w-full"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ControlledCityPicker
                                provinciaLabel="Provincia di detenzione"
                                comuneLabel="Comune di detenzione"
                                fieldName="location_city_code"
                                className="w-full"
                            />
                        </div>
                    </div>
                ) : (
                    <p className="flex items-center gap-2 text-sm text-surface-500">
                        <FontAwesomeIcon icon={faLock} />
                        Seleziona o crea prima l'adottante per inserire il
                        luogo di detenzione.
                    </p>
                )}
            </Step>
        </>
    )
}

export default ExitDetentionSteps
