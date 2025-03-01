import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { ControlledInputProps } from "./ControlledInputProps"

type Props<T extends FieldValues> = ControlledInputProps<T> & {
    label: string
    uppercase?: boolean
}

const ControlledInputText = <T extends FieldValues>(props: Props<T>) => {
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
                    {/* <label
                        htmlFor={field.name}
                        className={classNames({
                            // "p-error": errors.name,
                        })}
                    ></label> */}
                    <div className={props.className}>
                        <InputLabel
                            htmlFor={field.name}
                            disabled={props.disabled}
                        >
                            {props.label}
                        </InputLabel>
                        <InputText
                            id={field.name}
                            className={classNames("p-inputtext-sm w-full", {
                                "p-invalid": fieldState.error,
                                uppercase: props.uppercase,
                            })}
                            {...register(props.fieldName)}
                            disabled={props.disabled}
                        />
                        {errors.name && (
                            <span className="text-xs text-red-500">
                                {errors.name.message?.toString()}
                            </span>
                        )}
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
        />
    )
}

export default ControlledInputText
