import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { InputLabel } from "../../typography"

type Props = {
    label: string
    className?: string
    disabled?: boolean
    error?: boolean
    onChange?: (value: string) => void
}

const UncontrolledInputText = (props: Props) => {
    return (
        <div className={props.className}>
            <InputLabel disabled={props.disabled}>{props.label}</InputLabel>
            <InputText
                className={classNames("p-inputtext-sm w-full", {
                    "p-invalid": props.error,
                })}
                onChange={(e) => props.onChange?.(e.target.value)}
                disabled={props.disabled}
            />
            {props.error && (
                <span className="text-xs text-red-500">{props.error}</span>
            )}
        </div>
    )
}

export default UncontrolledInputText
