import { Dropdown } from "primereact/dropdown"
import { Controller, useFormContext } from "react-hook-form"
import { classNames } from "primereact/utils"
import { useRacesQuery } from "../../queries"

type Props = {
    placeholder?: string
    className?: string
}
const ControlledRacesDropdown = (props: Props) => {
    const racesQuery = useRacesQuery()
    const form = useFormContext<{ race_id: string }>()

    const {
        control,
        // formState: { errors },
    } = form
    return (
        <Controller
            name="race_id"
            control={form.control}
            render={({ field }) => (
                <div className="w-full">
                    <label
                        className="text-xs text-gray-500"
                        htmlFor={field.name}
                    >
                        Tipo
                    </label>

                    <Dropdown
                        {...field}
                        options={racesQuery.data}
                        optionLabel="name"
                        optionValue="id"
                        placeholder={props.placeholder}
                        className={classNames(
                            "w-full md:w-14rem",
                            props.className
                        )}
                    />
                </div>
            )}
        />
    )
}

export default ControlledRacesDropdown
