import { Controller, useForm } from "react-hook-form"
import { apiService } from "../../main"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { Dropdown } from "primereact/dropdown"
import {
    Animal,
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
    // first entry must also specify race
    animalId?: string
    title?: string
    onSuccess?: (code: string) => void
}

const NewAnimalForm = (props: Props) => {
    const form = useForm<NewAnimalEntry>({
        resolver: zodResolver(newAnimalEntrySchema),
    })

    const { handleSubmit, watch, setValue } = form

    const [provincia, setProvincia] = useState<string>()
    const provinceQuery = useProvinceQuery()
    const racesQuery = useRacesQuery()
    const comuniQuery = useComuniQuery(provincia)
    const entryTypesQuery = useEntryTypesQuery()

    // Watch the entry_type field
    const selectedEntryType = watch("entry_type")

    // Automatically set healthcare_stage based on selected entry type
    useEffect(() => {
        if (selectedEntryType && entryTypesQuery.data) {
            const entryType = entryTypesQuery.data.find(
                (et) => et.id === selectedEntryType
            )
            if (entryType) {
                setValue("healthcare_stage", entryType.healthcare_stage)
            }
        }
    }, [selectedEntryType, entryTypesQuery.data, setValue])

    const queryClient = useQueryClient()
    const newEntryMutation = useMutation({
        mutationKey: "new-animal-entry",
        mutationFn: (data: NewAnimalEntry) => {
            if (props.animalId) {
                return apiService.addAnimalEntry(props.animalId, data)
            } else {
                return apiService.createAnimal(data)
            }
        },
        onSuccess: (data: string, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["animal-search"],
            })
            if (props.animalId) {
                queryClient.setQueryData(
                    ["animal", props.animalId],
                    //@ts-ignore: types Updater and Animal are not compatible
                    (old: Animal) => ({
                        ...old,
                        entry_type: variables.entry_type,
                        entry_date: null,
                        exit_date: null,
                        exit_type: null,
                    })
                )
            }
            props.onSuccess?.(data)
        },
    })
    const onSubmit = async (data: NewAnimalEntry) => {
        newEntryMutation.mutate(data)
    }
    return (
        <div className="w-full">
            <SubTitle>{props.title || "Nuovo ingresso"}</SubTitle>
            <Divider />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="flex flex-col gap-2 items-start">
                    {!props.animalId && (
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
                    )}
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

                    <div className="flex items-center gap-2">
                        <Controller
                            name="healthcare_stage"
                            control={form.control}
                            render={({ field }) => (
                                <>
                                    <Checkbox
                                        inputId="healthcare_stage"
                                        checked={field.value || false}
                                        onChange={(e) =>
                                            field.onChange(e.checked)
                                        }
                                    />
                                    <label
                                        htmlFor="healthcare_stage"
                                        className="text-sm cursor-pointer"
                                    >
                                        Sanitario
                                    </label>
                                </>
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
