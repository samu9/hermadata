import { Password } from "primereact/password"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { ControlledInputProps } from "./ControlledInputProps"
import { useEffect } from "react"
import { InputText } from "primereact/inputtext"

type Props<T extends FieldValues> = ControlledInputProps<T> & {
    label: string
}

const ControlledInputPassword = <T extends FieldValues>(props: Props<T>) => {
    const form = useFormContext<T>()

    const {
        control,
        formState: { errors },
        register,
        getValues,
    } = form
    useEffect(() => {
        console.log(getValues())
    }, [getValues()])
    return (
        <Controller
            name={props.fieldName}
            control={control}
            // rules={{ required: "Name - Surname is required." }}
            render={({ field, fieldState }) => (
                <>
                    <div
                        className={classNames(
                            "flex flex-col gap-1",
                            props.className
                        )}
                    >
                        <InputLabel
                            htmlFor={field.name}
                            disabled={props.disabled}
                        >
                            {props.label}
                        </InputLabel>
                        <InputText
                            type="password"
                            id={field.name}
                            className={classNames("", {
                                "p-invalid": fieldState.error,
                            })}
                            tabIndex={1}
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

export default ControlledInputPassword
