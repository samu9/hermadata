import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { apiService } from "../main"
import {
    animalExitsReportSchema,
    AnimalExitsReportSchema,
} from "../models/animal.schema"
import {
    useComuniQuery,
    useEntryTypesQuery,
    useExitTypesQuery,
    useProvinceQuery,
} from "../queries"
import ControlledInputDate from "./forms/ControlledInputDate"
import { SubTitle } from "./typography"

const AnimalExitsForm = () => {
    const [provincia, setProvincia] = useState<string>()

    const provinceQuery = useProvinceQuery()
    const comuniQuery = useComuniQuery(provincia)
    const exitTypesQuery = useExitTypesQuery()

    const form = useForm<AnimalExitsReportSchema>({
        resolver: zodResolver(animalExitsReportSchema),
    })

    const {
        handleSubmit,
        formState: { isValid },
    } = form

    // React Query Mutation for API call
    const downloadReport = useMutation({
        mutationFn: (request: AnimalExitsReportSchema) =>
            apiService.animalExitsReport(request),
        onSuccess: (
            result: { url: string; filename: string },
            variables: AnimalExitsReportSchema,
            context
        ) => {
            const link = document.createElement("a")
            link.href = result.url
            link.setAttribute("download", result.filename)
            document.body.appendChild(link)
            link.click()
        },
        mutationKey: "animalDays",
    })

    // Handle form submission
    const onSubmit = async (data: AnimalExitsReportSchema) => {
        const validated = animalExitsReportSchema.parse(data)
        downloadReport.mutateAsync(validated)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SubTitle>Report uscite</SubTitle>
            <FormProvider {...form}>
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex gap-2">
                        <ControlledInputDate
                            fieldName="from_date"
                            label="Data inizio"
                        />
                        <ControlledInputDate
                            fieldName="to_date"
                            label="Data fine"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
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
                            name="city_code"
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
                    </div>
                    <div>
                        <Controller
                            name="exit_type"
                            control={form.control}
                            render={({ field }) => (
                                <div className="w-full">
                                    <label
                                        className="text-xs text-gray-500"
                                        htmlFor={field.name}
                                    >
                                        Tipo di uscita
                                    </label>
                                    <Dropdown
                                        {...field}
                                        options={exitTypesQuery.data}
                                        optionLabel="label"
                                        optionValue="id"
                                        placeholder="Seleziona"
                                        className="w-full"
                                    />
                                </div>
                            )}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isValid}
                    >
                        <FontAwesomeIcon
                            icon={faDownload}
                            fixedWidth
                            className="pr-2"
                        />{" "}
                        Scarica
                    </Button>
                </div>
            </FormProvider>
        </form>
    )
}

export default AnimalExitsForm
