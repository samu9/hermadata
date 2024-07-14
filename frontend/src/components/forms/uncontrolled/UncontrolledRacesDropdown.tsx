import { classNames } from "primereact/utils"
import { useRacesQuery } from "../../../queries"
import { InputLabel } from "../../typography"
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown"
import { useState } from "react"

type Props = {
    value?: string
    className?: string
    disabled?: boolean
    placeholder?: string
    onChange?: (value: string) => void
}

const UncontrolledRacesDropdown = (props: Props) => {
    const racesQuery = useRacesQuery()
    const [value, setValue] = useState<string | null>(props.value || null)
    return (
        <div className={classNames(props.className)}>
            <InputLabel disabled={props.disabled}>Tipo</InputLabel>
            <Dropdown
                value={value}
                onChange={(e: DropdownChangeEvent) => {
                    setValue(e.value)
                    props.onChange?.(e.value)
                }}
                disabled={props.disabled}
                options={racesQuery.data}
                optionLabel="name"
                optionValue="id"
                placeholder={props.placeholder}
                className="w-full"
            />
        </div>
    )
}

export default UncontrolledRacesDropdown
