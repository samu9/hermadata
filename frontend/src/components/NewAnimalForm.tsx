import { Controller, useForm } from "react-hook-form"
import { apiService } from "../main"
import { NewAnimal, newAnimalSchema } from "../models/new-animal.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { classNames } from "primereact/utils"
import { Calendar } from "primereact/calendar"

const NewAnimalForm = () => {
    const form = useForm<NewAnimal>({
        resolver: zodResolver(newAnimalSchema),
    })

    const {
        register,
        handleSubmit,
        watch,
        getValues,
        formState: { errors },
    } = form

    const [provincia, setProvincia] = useState<string>()
    const provinceQuery = useQuery("province", () => apiService.getProvince(), {
        placeholderData: [],
        staleTime: Infinity,
    })
    const racesQuery = useQuery("races", () => apiService.getRaces(), {
        placeholderData: [],
        staleTime: Infinity,
    })
    const comuniQuery = useQuery(
        ["comuni", provincia],
        () => (provincia && apiService.getComuni(provincia)) || [],
        {
            placeholderData: [],
            staleTime: Infinity,
        }
    )

    const onSubmit = async (data: NewAnimal) => {
        console.log(data)

        const result = await apiService.createAnimal(data)
        console.log(result)
        return result
    }
    return (
        <div className="border border-primary p-2 rounded max-w-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2 items-start">
                    <Controller
                        name="race_id"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div>
                                <label
                                    className="text-xs text-gray-500"
                                    htmlFor={field.name}
                                >
                                    Razza
                                </label>

                                <Dropdown
                                    {...field}
                                    options={racesQuery.data}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Seleziona"
                                    className="w-full md:w-14rem"
                                />
                            </div>
                        )}
                    />
                    <div className="flex gap-2 w-full">
                        <div>
                            <label
                                className="text-xs text-gray-500"
                                htmlFor="comune"
                            >
                                Provincia
                            </label>
                            <Dropdown
                                value={provincia}
                                onChange={(e) => {
                                    setProvincia(e.target.value)
                                }}
                                options={provinceQuery.data}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Seleziona"
                                className="w-full"
                            />
                        </div>

                        <Controller
                            name="rescue_city_code"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div>
                                    <label
                                        className="text-xs text-gray-500"
                                        htmlFor={field.name}
                                    >
                                        Comune
                                    </label>
                                    <Dropdown
                                        {...field}
                                        options={comuniQuery.data}
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Seleziona"
                                        className="w-full"
                                    />
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex gap-2 w-full">
                        <Controller
                            name="rescue_type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div>
                                    <label
                                        className="text-xs text-gray-500"
                                        htmlFor={field.name}
                                    >
                                        Tipo di ingresso
                                    </label>

                                    <Dropdown
                                        {...field}
                                        options={[
                                            { id: "R", name: "Recupero" },
                                            { id: "C", name: "Conferimento" },
                                            { id: "S", name: "Sequestro " },
                                        ]}
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Seleziona"
                                        className="w-full"
                                    />
                                </div>
                            )}
                        />
                        <Controller
                            name="rescue_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div>
                                    <label
                                        className="text-xs text-gray-500"
                                        htmlFor={field.name}
                                    >
                                        Data ingresso
                                    </label>
                                    <div className="w-full">
                                        <Calendar
                                            inputId={field.name}
                                            value={field.value}
                                            onChange={field.onChange}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                            locale="en"
                                            className={classNames({
                                                "p-invalid": fieldState.error,
                                            })}
                                        />
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    <Button type="submit">Salva</Button>
                </div>
            </form>
        </div>
    )
}
export default NewAnimalForm
