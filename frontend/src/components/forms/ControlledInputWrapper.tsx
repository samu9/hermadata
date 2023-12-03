import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Controller, FieldValues, useFormContext } from "react-hook-form"
import { InputLabel } from "../typography"
import { ControlledInputProps } from "./ControlledInputProps"
import { InputTextarea } from "primereact/inputtextarea"

type Props<T extends FieldValues> = ControlledInputProps<T> & {
    label: string
    children: React.ReactNode
}

const ControlledTextarea = <T extends FieldValues>(props: Props<T>) => {
    const form = useFormContext<T>()

    const {
        control,
        // formState: { errors },
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
                        <InputLabel htmlFor={field.name}>
                            {props.label}
                        </InputLabel>

                        {props.children}
                    </div>
                    {/* {getFormErrorMessage(field.name)} */}
                </>
            )}
        />
    )
}

export default ControlledTextarea
