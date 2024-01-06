import { Controller, useForm } from "react-hook-form"
import { apiService } from "../../main"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import {
    NewAnimalEntry,
    newAnimalEntrySchema,
} from "../../models/animal.schema"
import { Divider } from "primereact/divider"
import { SubTitle } from "../typography"
import {
    useComuniQuery,
    useEntryTypesQuery,
    useProvinceQuery,
    useRacesQuery,
} from "../../queries"

type Props = {
    onSuccess?: (code: string) => void
}

const NewAnimalForm = (props: Props) => {
    const form = useForm<NewAnimalEntry>({
        resolver: zodResolver(newAnimalEntrySchema),
    })

    const { handleSubmit } = form

    const [provincia, setProvincia] = useState<string>()
    const provinceQuery = useProvinceQuery()
    const racesQuery = useRacesQuery()
    const comuniQuery = useComuniQuery(provincia)
    const entryTypesQuery = useEntryTypesQuery()

    const queryClient = useQueryClient()
    const newEntryMutation = useMutation({
        mutationKey: "new-animal-entry",
        mutationFn: (data: NewAnimalEntry) =>
            apiService.createAnimalEntry(data),
        onSuccess: (data: string) => {
            queryClient.invalidateQueries({
                queryKey: ["animal-search"],
            })
            props.onSuccess?.(data)
        },
    })
    const onSubmit = async (data: NewAnimalEntry) => {
        newEntryMutation.mutate(data)
    }
    return (
        <div className="w-full">
            <SubTitle>Nuovo ingresso</SubTitle>
            <Divider />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="flex flex-col gap-2 items-start">
                    <Controller
                        name="race_id"
                        control={form.control}
                        render={({ field }) => (
                            <div className="w-1/2">
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
                                    placeholder="Seleziona"
                                    className="w-full md:w-14rem"
                                />
                            </div>
                        )}
                    />
                    <div className="flex flex-col w-full">
                        <label
                            className="text-xs text-gray-500"
                            htmlFor="provincia"
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
                        render={({ field }) => (
                            <div className="w-full">
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

                    <div className="flex gap-2 w-full">
                        <Controller
                            name="entry_type"
                            control={form.control}
                            render={({ field }) => (
                                <div className="w-full">
                                    <label
                                        className="text-xs text-gray-500"
                                        htmlFor={field.name}
                                    >
                                        Tipo di ingresso
                                    </label>

                                    <Dropdown
                                        {...field}
                                        options={entryTypesQuery.data}
                                        optionLabel="label"
                                        optionValue="id"
                                        placeholder="Seleziona"
                                        className="w-full"
                                    />
                                </div>
                            )}
                        />
                    </div>
                </div>
                <Divider />
                <Button
                    severity="success"
                    className="ml-auto block"
                    type="submit"
                >
                    Salva
                </Button>
            </form>
        </div>
    )
}
export default NewAnimalForm
