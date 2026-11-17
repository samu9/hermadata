import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { MultiSelect } from "primereact/multiselect"
import { useId } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { apiService } from "../main"
import {
    animalOverviewReportSchema,
    AnimalOverviewReportSchema,
} from "../models/animal.schema"
import { useEntryTypesQuery, useExitTypesQuery } from "../queries"
import ComuniMultiAutoComplete from "./forms/city/ComuniMultiAutoComplete"
import ControlledInputDate from "./forms/ControlledInputDate"
import ControlledRaceMultiSelect from "./forms/ControlledRaceMultiSelect"
import { SubTitle } from "./typography"

type TypesFieldName = "entry_types" | "exit_types"

const TypesMultiSelect = (props: {
    name: TypesFieldName
    label: string
    options?: { id: string; label: string }[]
}) => {
    const inputId = useId()
    return (
        <Controller<AnimalOverviewReportSchema, TypesFieldName>
            name={props.name}
            render={({ field }) => (
                <div>
                    <label
                        className="block text-sm font-medium mb-1 text-surface-700"
                        htmlFor={inputId}
                    >
                        {props.label}
                    </label>
                    <MultiSelect
                        inputId={inputId}
                        value={field.value}
                        onChange={(event) => field.onChange(event.value)}
                        onBlur={field.onBlur}
                        options={props.options}
                        optionLabel="label"
                        optionValue="id"
                        placeholder="Nessuno (sezione esclusa)"
                        display="chip"
                        className="w-full"
                    />
                </div>
            )}
        />
    )
}

const AnimalOverviewReportForm = () => {
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()
    const citiesInputId = useId()
    const splitInputId = useId()

    const form = useForm<AnimalOverviewReportSchema>({
        defaultValues: {
            race_ids: [],
            city_codes: [],
            entry_types: [],
            exit_types: [],
            split_by_city: false,
        },
        mode: "onChange",
        resolver: zodResolver(animalOverviewReportSchema),
    })

    const {
        handleSubmit,
        formState: { isValid, errors, isDirty },
    } = form

    const downloadReport = useMutation({
        mutationFn: (request: AnimalOverviewReportSchema) =>
            apiService.animalOverviewReport(request),
        onSuccess: (result: { url: string; filename: string }) => {
            const link = document.createElement("a")
            link.href = result.url
            link.setAttribute("download", result.filename)
            document.body.appendChild(link)
            link.click()
        },
        mutationKey: "animalOverview",
    })

    const onSubmit = async (data: AnimalOverviewReportSchema) => {
        const validated = animalOverviewReportSchema.parse(data)
        downloadReport.mutateAsync(validated)
    }

    const errorMessages = [
        errors.from_date?.message,
        errors.to_date?.message,
        errors.entry_types?.message,
    ].filter(Boolean)

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubTitle className="!mb-2">Report riepilogativo</SubTitle>
                <p className="text-sm text-surface-500 mb-6">
                    Ingressi e uscite giorno per giorno, un foglio per tipo di
                    animale, più un riepilogo per comune. Indicare almeno una
                    data e almeno un tipo di ingresso o di uscita.
                </p>
                <FormProvider {...form}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ControlledInputDate
                            fieldName="from_date"
                            label="Data inizio"
                        />
                        <ControlledInputDate
                            fieldName="to_date"
                            label="Data fine"
                        />
                        <ControlledRaceMultiSelect />
                        <Controller
                            name="city_codes"
                            control={form.control}
                            render={({ field }) => (
                                <div>
                                    <label
                                        className="block text-sm font-medium mb-1 text-surface-700"
                                        htmlFor={citiesInputId}
                                    >
                                        Comuni
                                    </label>
                                    <ComuniMultiAutoComplete
                                        id={citiesInputId}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Tutti i comuni"
                                        className="w-full"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <Controller
                                            name="split_by_city"
                                            control={form.control}
                                            render={({ field: split }) => (
                                                <Checkbox
                                                    inputId={splitInputId}
                                                    checked={split.value}
                                                    onChange={(e) =>
                                                        split.onChange(
                                                            !!e.checked,
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                        <label
                                            htmlFor={splitInputId}
                                            className="text-sm text-surface-700 cursor-pointer"
                                        >
                                            Dividi per comune (un foglio per
                                            comune)
                                        </label>
                                    </div>
                                </div>
                            )}
                        />
                        <TypesMultiSelect
                            name="entry_types"
                            label="Tipi di ingresso"
                            options={entryTypesQuery.data}
                        />
                        <TypesMultiSelect
                            name="exit_types"
                            label="Tipi di uscita"
                            options={exitTypesQuery.data}
                        />
                    </div>
                    {isDirty && errorMessages.length > 0 && (
                        <ul className="mt-4 text-sm text-red-600">
                            {errorMessages.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-6 flex justify-end">
                        <Button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isValid}
                            className="!bg-primary-600 !border-primary-600 hover:!bg-primary-700 gap-2"
                        >
                            <FontAwesomeIcon icon={faDownload} fixedWidth />
                            Scarica Report
                        </Button>
                    </div>
                </FormProvider>
            </form>
        </div>
    )
}

export default AnimalOverviewReportForm
