import { classNames } from "primereact/utils"
import { useProvinceQuery } from "../../../queries"
import { InputLabel } from "../../typography"
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown"
import { useState } from "react"

type Props = {
    value?: string
    className?: string
    disabled?: boolean
    placeholder?: string
    label?: string
    onChange?: (value: string) => void
}

const UncontrolledProvinceDropdown = (props: Props) => {
    const provinceQuery = useProvinceQuery()
    const [value, setValue] = useState<string | null>(props.value || null)
    
    // React to prop changes
    if (props.value !== undefined && props.value !== value) {
        setValue(props.value)
    }

    return (
        <div className={classNames(props.className)}>
            <InputLabel disabled={props.disabled}>
                {props.label || "Provincia"}
            </InputLabel>
            <Dropdown
                value={value}
                onChange={(e: DropdownChangeEvent) => {
                    setValue(e.value)
                    props.onChange?.(e.value)
                }}
                disabled={props.disabled}
                options={provinceQuery.data}
                optionLabel="name"
                optionValue="id"
                placeholder={props.placeholder}
                className="w-full"
            />
        </div>
    )
}

export default UncontrolledProvinceDropdown
