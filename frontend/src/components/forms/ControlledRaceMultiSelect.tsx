import { MultiSelect } from "primereact/multiselect"
import { useId } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useRacesQuery } from "../../queries"

const ControlledRaceMultiSelect = () => {
    const { control } = useFormContext<{ race_ids: string[] }>()
    const { data: races, isLoading } = useRacesQuery()
    const inputId = useId()

    return (
        <Controller
            name="race_ids"
            control={control}
            render={({ field }) => (
                <div>
                    <label
                        className="block text-sm font-medium mb-1 text-surface-700"
                        htmlFor={inputId}
                    >
                        Tipi di animale (obbligatorio)
                    </label>
                    <MultiSelect
                        inputId={inputId}
                        value={field.value}
                        onChange={(event) => field.onChange(event.value)}
                        onBlur={field.onBlur}
                        options={races}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Seleziona almeno un tipo"
                        loading={isLoading}
                        className="w-full"
                    />
                </div>
            )}
        />
    )
}

export default ControlledRaceMultiSelect
