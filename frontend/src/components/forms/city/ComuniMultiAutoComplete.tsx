import {
    AutoComplete,
    AutoCompleteChangeEvent,
    AutoCompleteCompleteEvent,
} from "primereact/autocomplete"
import { useMemo, useState } from "react"
import { ComuneSchema } from "../../../models/city.schema"
import { useAllComuniQuery } from "../../../queries"
import { searchComuni } from "../../../utils/citySearch"

type Props = {
    id?: string
    /** Comune codes */
    value: string[]
    onChange: (codes: string[]) => void
    className?: string
    disabled?: boolean
    placeholder?: string
}

/** Multiple comuni picker with fuzzy search on the name, across all Italy. */
const ComuniMultiAutoComplete = (props: Props) => {
    const comuniQuery = useAllComuniQuery()
    const [suggestions, setSuggestions] = useState<ComuneSchema[]>([])

    const selected = useMemo(() => {
        const byCode = new Map(comuniQuery.data?.map((c) => [c.id, c]))
        return props.value.map(
            (code) => byCode.get(code) ?? { id: code, name: code, provincia: "" },
        )
    }, [comuniQuery.data, props.value])

    const completeMethod = (e: AutoCompleteCompleteEvent) => {
        const notSelected = (comuniQuery.data ?? []).filter(
            (c) => !props.value.includes(c.id),
        )
        setSuggestions(searchComuni(notSelected, e.query))
    }

    return (
        <AutoComplete
            inputId={props.id}
            multiple
            value={selected}
            suggestions={suggestions}
            completeMethod={completeMethod}
            onChange={(e: AutoCompleteChangeEvent) =>
                props.onChange((e.value as ComuneSchema[]).map((c) => c.id))
            }
            field="name"
            selectedItemTemplate={(c: ComuneSchema) =>
                c.provincia ? `${c.name} (${c.provincia})` : c.name
            }
            itemTemplate={(c: ComuneSchema) => (
                <div className="flex justify-between gap-3">
                    <span>{c.name}</span>
                    <span className="text-surface-400">{c.provincia}</span>
                </div>
            )}
            disabled={props.disabled || comuniQuery.isLoading}
            placeholder={props.placeholder ?? "Cerca comune"}
            emptyMessage="Nessun risultato"
            showEmptyMessage
            autoHighlight
            delay={0}
            className={props.className}
        />
    )
}

export default ComuniMultiAutoComplete
