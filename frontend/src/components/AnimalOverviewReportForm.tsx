import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { MultiSelect } from "primereact/multiselect"
import { useId, useMemo } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useMutation } from "react-query"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../main"
import {
    animalOverviewReportSchema,
    AnimalOverviewReportSchema,
} from "../models/animal.schema"
import {
    useAllComuniQuery,
    useEntryTypesQuery,
    useExitTypesQuery,
} from "../queries"
import ComuniMultiAutoComplete from "./forms/city/ComuniMultiAutoComplete"
import ControlledInputDate from "./forms/ControlledInputDate"
import ControlledRaceMultiSelect from "./forms/ControlledRaceMultiSelect"
import { SubTitle } from "./typography"

type TypesFieldName = "entry_types" | "exit_types"

type QuickAction = {
    label: string
    onClick: () => void
    disabled?: boolean
    title?: string
}

/** Field label with quick selection links on the right. */
const LabelWithActions = (props: {
    htmlFor: string
    label: string
    actions: QuickAction[]
}) => (
    <div className="flex items-end justify-between gap-3 mb-1">
        <label
            className="text-sm font-medium text-surface-700"
            htmlFor={props.htmlFor}
        >
            {props.label}
        </label>
        <div className="flex gap-3 text-xs">
            {props.actions.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={action.title}
                    className="text-primary-600 hover:underline disabled:text-surface-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                    {action.label}
                </button>
            ))}
        </div>
    </div>
)

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
                    <LabelWithActions
                        htmlFor={inputId}
                        label={props.label}
                        actions={[
                            {
                                label: "Tutti",
                                onClick: () =>
                                    field.onChange(
                                        (props.options ?? []).map((o) => o.id),
                                    ),
                                disabled:
                                    !props.options?.length ||
                                    field.value.length === props.options.length,
                            },
                            {
                                label: "Nessuno",
                                onClick: () => field.onChange([]),
                                disabled: field.value.length === 0,
                            },
                        ]}
                    />
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
    const comuniQuery = useAllComuniQuery()
    const { user } = useAuth()
    const citiesInputId = useId()
    const splitInputId = useId()

    // Users bound to some comuni can only extract those
    const favouriteCodes = useMemo(() => {
        const allowed = user?.city_codes?.length
            ? new Set(user.city_codes)
            : null
        return (comuniQuery.data ?? [])
            .filter((c) => c.favourite && (!allowed || allowed.has(c.id)))
            .map((c) => c.id)
    }, [comuniQuery.data, user?.city_codes])

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
                                    <LabelWithActions
                                        htmlFor={citiesInputId}
                                        label="Comuni"
                                        actions={[
                                            {
                                                label: "Tutti i preferiti",
                                                onClick: () =>
                                                    field.onChange([
                                                        ...new Set([
                                                            ...field.value,
                                                            ...favouriteCodes,
                                                        ]),
                                                    ]),
                                                disabled:
                                                    favouriteCodes.length ===
                                                        0 ||
                                                    favouriteCodes.every((c) =>
                                                        field.value.includes(c),
                                                    ),
                                                title:
                                                    favouriteCodes.length === 0
                                                        ? "Nessun comune preferito (Pannello Admin › Comuni preferiti)"
                                                        : "Aggiunge tutti i comuni preferiti",
                                            },
                                            {
                                                label: "Svuota",
                                                onClick: () =>
                                                    field.onChange([]),
                                                disabled:
                                                    field.value.length === 0,
                                                title: "Nessun comune selezionato = tutti i comuni",
                                            },
                                        ]}
                                    />
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
