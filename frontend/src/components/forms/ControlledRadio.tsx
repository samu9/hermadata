import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { RadioButton } from "primereact/radiobutton"
import { ControlledInputProps } from "./ControlledInputProps"

type Props<T extends FieldValues, X> = ControlledInputProps<T> & {
    values: { value: X; label: string }[]
}

const ControlledRadio = <T extends FieldValues, X>(props: Props<T, X>) => {
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
            // rules={{ required: "Name - Surname is required." }}
            render={({ field, fieldState }) => (
                <>
                    <label
                        htmlFor={field.name}
                        className={classNames({
                            // "p-error": errors.name,
                        })}
                    ></label>
                    <div className="flex items-center gap-4">
                        {props.values.map((v, i) => (
                            <span className="flex items-center gap-2" key={i}>
                                <InputLabel htmlFor={field.name}>
                                    {v.label}
                                </InputLabel>
                                <RadioButton
                                    inputId={i.toString()}
                                    inputRef={field.ref}
                                    {...field}
                                    value={v.value}
                                    checked={field.value === v.value}
                                />
                            </span>
                        ))}
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
        />
    )
}

export default ControlledRadio
