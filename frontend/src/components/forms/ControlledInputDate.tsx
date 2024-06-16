import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { Calendar } from "primereact/calendar"
import { ControlledInputProps } from "./ControlledInputProps"

type Props<T extends FieldValues> = ControlledInputProps<T> & {
    label: string
    disabled?: boolean
}

const ControlledInputDate = <T extends FieldValues>(props: Props<T>) => {
    const form = useFormContext<T>()

    const {
        control,
        formState: { errors },
        register,
    } = form
    return (
        <Controller
            name={props.fieldName}
            control={control}
            rules={{}}
            render={({ field, fieldState }) => (
                <>
                    {/* <label
                        htmlFor={field.name}
                        className={classNames({
                            // "p-error": errors.name,
                        })}
                    ></label> */}
                    <div className={props.className}>
                        <InputLabel htmlFor={field.name}>
                            {props.label}
                        </InputLabel>
                        <Calendar
                            inputId={field.name}
                            value={field.value ?? new Date(field.value)}
                            onChange={field.onChange}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                        />
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
            disabled={props.disabled}
        />
    )
}

export default ControlledInputDate
