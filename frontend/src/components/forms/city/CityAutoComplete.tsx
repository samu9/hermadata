import {
    AutoComplete,
    AutoCompleteChangeEvent,
    AutoCompleteCompleteEvent,
} from "primereact/autocomplete"
import { classNames } from "primereact/utils"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { findExactByName } from "../../../utils/citySearch"
import { InputLabel } from "../../typography"

type Item = { id: string; name: string }

export type CityAutoCompleteProps = {
    id?: string
    label?: string
    value?: string | null
    onChange?: (id: string | null) => void
    className?: string
    disabled?: boolean
    placeholder?: string
}

type Props<T extends Item> = CityAutoCompleteProps & {
    items: T[]
    loading?: boolean
    search: (items: T[], query: string) => T[]
    itemTemplate: (item: T) => ReactNode
    onSelectItem?: (item: T | null) => void
}

/**
 * Single-value autocomplete over a list of `{ id, name }`, the value being
 * the item id. While typing, the input holds free text; on blur it settles
 * back to a valid item (the one typed exactly, or the previous selection),
 * so the value is never an unknown id.
 */
const CityAutoComplete = <T extends Item>(props: Props<T>) => {
    const selected = useMemo(
        () => props.items.find((i) => i.id === props.value) ?? null,
        [props.items, props.value],
    )
    const [inputValue, setInputValue] = useState<T | string | null>(selected)
    const [suggestions, setSuggestions] = useState<T[]>([])

    useEffect(() => setInputValue(selected), [selected])

    const select = (item: T | null) => {
        setInputValue(item)
        if (item?.id !== selected?.id) {
            props.onChange?.(item?.id ?? null)
            props.onSelectItem?.(item)
        }
    }

    const onChange = (e: AutoCompleteChangeEvent) => {
        if (e.value && typeof e.value === "object") select(e.value)
        else setInputValue(e.value ?? null)
    }

    const onBlur = () => {
        if (typeof inputValue !== "string") return
        if (!inputValue.trim()) select(null)
        else select(findExactByName(props.items, inputValue) ?? selected)
    }

    return (
        <div className={classNames(props.className)}>
            {props.label && (
                <InputLabel htmlFor={props.id} disabled={props.disabled}>
                    {props.label}
                </InputLabel>
            )}
            <AutoComplete
                inputId={props.id}
                value={inputValue}
                suggestions={suggestions}
                completeMethod={(e: AutoCompleteCompleteEvent) =>
                    setSuggestions(props.search(props.items, e.query))
                }
                onChange={onChange}
                onBlur={onBlur}
                field="name"
                itemTemplate={props.itemTemplate}
                disabled={props.disabled || props.loading}
                placeholder={
                    props.loading ? "Caricamento..." : props.placeholder
                }
                emptyMessage="Nessun risultato"
                showEmptyMessage
                autoHighlight
                dropdown
                delay={0}
                className="w-full"
                inputClassName="w-full"
            />
        </div>
    )
}

export default CityAutoComplete
