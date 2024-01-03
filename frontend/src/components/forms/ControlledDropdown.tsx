import { Dropdown } from "primereact/dropdown"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { ControlledInputProps } from "./ControlledInputProps"

type Props<T extends FieldValues, X> = ControlledInputProps<T> & {
    label: string
    options: X[] | undefined
    optionLabel: Path<X>
    optionValue: Path<X>
    placeholder?: string
}

const ControlledDropdown = <T extends FieldValues, X>(props: Props<T, X>) => {
    const form = useFormContext<T>()

    const {
        control,
        // formState: { errors },
    } = form
    return (
        <Controller
            name={props.fieldName}
            control={control}
            // rules={{ required: "Name - Surname is required." }}
            render={({ field, fieldState }) => (
                <>
                    {/* <label
                        htmlFor={field.name}
                        className={classNames({
                            // "p-error": errors.name,
                        })}
                    ></label> */}
                    <div className={classNames(props.className)}>
                        <InputLabel
                            htmlFor={field.name}
                            disabled={props.disabled}
                        >
                            {props.label}
                        </InputLabel>
                        <Dropdown
                            disabled={props.disabled}
                            {...field}
                            options={props.options}
                            optionLabel={props.optionLabel}
                            emptyMessage="Nessun risultato"
                            optionValue={props.optionValue}
                            placeholder={props.placeholder}
                            className="w-full"
                        />
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
        />
    )
}

export default ControlledDropdown
