import { classNames } from "primereact/utils"
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { Checkbox } from "primereact/checkbox"
import { ControlledInputProps } from "./ControlledInputProps"

type Props<T extends FieldValues> = ControlledInputProps<T> & {
    label: string
}

const ControlledCheckbox = <T extends FieldValues>(props: Props<T>) => {
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
                    <div
                        className={classNames(
                            "flex items-center gap-2",
                            props.className
                        )}
                    >
                        <InputLabel htmlFor={field.name}>
                            {props.label}
                        </InputLabel>
                        <Checkbox
                            inputId={field.name}
                            checked={field.value}
                            inputRef={field.ref}
                            className={classNames({
                                "p-invalid mr-1": fieldState.error,
                            })}
                            onChange={(e) => field.onChange(e.checked)}
                        />
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
        />
    )
}

export default ControlledCheckbox
