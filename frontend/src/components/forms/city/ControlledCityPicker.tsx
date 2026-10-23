import { Controller, FieldValues, useFormContext } from "react-hook-form"
import { ControlledInputProps } from "../ControlledInputProps"
import CityPicker, { CityPickerProps } from "./CityPicker"

type Props<T extends FieldValues> = ControlledInputProps<T> &
    Omit<CityPickerProps, "value" | "onChange" | "id" | "fieldClassName">

/** `CityPicker` bound to a comune code field of the surrounding form. */
const ControlledCityPicker = <T extends FieldValues>({
    fieldName,
    className,
    ...props
}: Props<T>) => {
    const { control } = useFormContext<T>()

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
                <CityPicker
                    {...props}
                    id={field.name}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    fieldClassName={className}
                />
            )}
        />
    )
}

export default ControlledCityPicker
