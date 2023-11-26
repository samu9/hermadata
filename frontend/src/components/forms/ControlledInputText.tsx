import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"

type Props<T extends FieldValues> = {
    fieldName: Path<T>
    label: string
    className?: string
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
                    <label
                        htmlFor={field.name}
                        className={classNames({
                            // "p-error": errors.name,
                        })}
                    ></label>
                    <div className={props.className}>
                        <InputLabel htmlFor={field.name}>
                            {props.label}
                        </InputLabel>
                        <InputText
                            id={field.name}
                            className={classNames("p-inputtext-sm w-full", {
                                "p-invalid": fieldState.error,
                            })}
                            {...register(props.fieldName)}
                        />
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
        />
    )
}

export default ControlledInputText
