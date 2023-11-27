import { FieldValues, Path } from "react-hook-form"

export type ControlledInputProps<T extends FieldValues> = {
    fieldName: Path<T>
    disabled?: boolean
    className?: string
}
