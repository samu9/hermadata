import { classNames } from "primereact/utils"
import { useComuniQuery } from "../../../queries"
import { InputLabel } from "../../typography"
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown"
import { useState } from "react"

type Props = {
    value?: string
    provincia: string
    className?: string
    disabled?: boolean
    placeholder?: string
    onChange?: (value: string) => void
}

const UncontrolledComuniDropdown = (props: Props) => {
    const comuniQuery = useComuniQuery(props.provincia)
    const [value, setValue] = useState<string | null>(props.value || null)
    return (
        <div className={classNames(props.className)}>
            <InputLabel disabled={props.disabled}>Comune</InputLabel>
            <Dropdown
                value={value}
                onChange={(e: DropdownChangeEvent) => {
                    setValue(e.value)
                    props.onChange?.(e.value)
                }}
                disabled={props.disabled}
                options={comuniQuery.data}
                optionLabel="name"
                optionValue="id"
                placeholder={props.placeholder}
                className="w-full"
            />
        </div>
    )
}

export default UncontrolledComuniDropdown
