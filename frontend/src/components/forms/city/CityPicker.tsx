import { useState } from "react"
import { ComuneSchema } from "../../../models/city.schema"
import { useAllComuniQuery } from "../../../queries"
import ComuneAutoComplete from "./ComuneAutoComplete"
import ProvinciaAutoComplete from "./ProvinciaAutoComplete"

export type CityPickerProps = {
    /** Comune code */
    value?: string | null
    onChange?: (code: string | null) => void
    provinciaLabel?: string
    comuneLabel?: string
    /** Applied to both fields, which are rendered as siblings */
    fieldClassName?: string
    disabled?: boolean
    /** Only allow these comuni, and hide the provincia field */
    allowedCodes?: string[] | null
    id?: string
}

/**
 * Provincia + comune pair. The provincia is optional: it only narrows the
 * comune suggestions, and picking a comune fills it in. Changing the
 * provincia clears a comune that doesn't belong to it.
 */
const CityPicker = (props: CityPickerProps) => {
    const comuniQuery = useAllComuniQuery()
    const selectedComune = comuniQuery.data?.find((c) => c.id === props.value)

    const [chosenProvincia, setChosenProvincia] = useState<string | null>(
        null,
    )
    const provincia = selectedComune?.provincia ?? chosenProvincia

    const onProvinciaChange = (value: string | null) => {
        setChosenProvincia(value)
        if (selectedComune && selectedComune.provincia !== value) {
            props.onChange?.(null)
        }
    }

    const onSelectComune = (comune: ComuneSchema | null) => {
        if (comune) setChosenProvincia(comune.provincia)
    }

    return (
        <>
            {!props.allowedCodes && (
                <ProvinciaAutoComplete
                    id={props.id && `${props.id}-provincia`}
                    label={props.provinciaLabel}
                    value={provincia}
                    onChange={onProvinciaChange}
                    className={props.fieldClassName}
                    disabled={props.disabled}
                />
            )}
            <ComuneAutoComplete
                id={props.id}
                label={props.comuneLabel}
                value={props.value}
                onChange={(code) => props.onChange?.(code)}
                onSelectComune={onSelectComune}
                provincia={provincia}
                allowedCodes={props.allowedCodes}
                className={props.fieldClassName}
                disabled={props.disabled}
            />
        </>
    )
}

export default CityPicker
