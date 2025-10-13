import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { apiService } from "../main"
import {
    animalDaysRequestSchema,
    AnimalDaysRequestSchema,
} from "../models/animal.schema"
import { useComuniQuery, useProvinceQuery } from "../queries"
import ControlledInputDate from "./forms/ControlledInputDate"
import { SubTitle } from "./typography"

const AnimalDaysForm = () => {
    const [provincia, setProvincia] = useState<string>()

    const provinceQuery = useProvinceQuery()
    const comuniQuery = useComuniQuery(provincia)

    const form = useForm<AnimalDaysRequestSchema>({
        resolver: zodResolver(animalDaysRequestSchema),
    })

    const {
        handleSubmit,
        formState: { isValid },
        watch,
        getValues,
    } = form

    // React Query Mutation for API call
    const downloadReport = useMutation({
        mutationFn: (request: AnimalDaysRequestSchema) =>
            apiService.animalDaysReport(request),
        onSuccess: (
            result: { url: string; filename: string }
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
    const onSubmit = async (data: AnimalDaysRequestSchema) => {
        const validated = animalDaysRequestSchema.parse(data)
        console.log(validated)
        downloadReport.mutateAsync(validated)
    }

    useEffect(() => {
        console.log(getValues().from_date)
    }, [watch()])
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SubTitle>Report giorni animale</SubTitle>
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

export default AnimalDaysForm
