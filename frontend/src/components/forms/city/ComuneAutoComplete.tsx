import { useMemo } from "react"
import { ComuneSchema } from "../../../models/city.schema"
import { useAllComuniQuery } from "../../../queries"
import { searchComuni } from "../../../utils/citySearch"
import CityAutoComplete, { CityAutoCompleteProps } from "./CityAutoComplete"
import ComuneItem from "./ComuneItem"

type Props = CityAutoCompleteProps & {
    /** Only suggest the comuni of this provincia */
    provincia?: string | null
    /** Only suggest these comuni (e.g. the ones a user is restricted to) */
    allowedCodes?: string[] | null
    onSelectComune?: (comune: ComuneSchema | null) => void
}

/** Comune picker with fuzzy search on the name, across all Italy. */
const ComuneAutoComplete = ({
    provincia,
    allowedCodes,
    onSelectComune,
    ...props
}: Props) => {
    const comuniQuery = useAllComuniQuery()

    const comuni = useMemo(
        () =>
            (comuniQuery.data ?? []).filter(
                (c) =>
                    (!provincia || c.provincia === provincia) &&
                    (!allowedCodes?.length || allowedCodes.includes(c.id)),
            ),
        [comuniQuery.data, provincia, allowedCodes],
    )

    return (
        <CityAutoComplete
            {...props}
            label={props.label ?? "Comune"}
            placeholder={props.placeholder ?? "Cerca comune"}
            items={comuni}
            loading={comuniQuery.isLoading}
            search={searchComuni}
            itemTemplate={(c: ComuneSchema) => <ComuneItem comune={c} />}
            onSelectItem={onSelectComune}
        />
    )
}

export default ComuneAutoComplete
