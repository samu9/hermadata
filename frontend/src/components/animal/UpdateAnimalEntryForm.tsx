import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import {
    AnimalEntry,
    UpdateAnimalEntry,
    updateAnimalEntrySchema,
} from "../../models/animal.schema"
import ControlledInputDate from "../forms/ControlledInputDate"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledTextarea from "../forms/ControlledTextarea"
import ControlledCheckbox from "../forms/ControlledCheckbox"
import ControlledInputText from "../forms/ControlledInputText"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"
import { useLoader } from "../../contexts/Loader"
import {
    useEntryTypesQuery,
    useExitTypesQuery,
    useComuniQuery,
    useComuneQuery,
    useAdopterQuery,
} from "../../queries"
import { useEffect, useState } from "react"
import { Adopter } from "../../models/adopter.schema"
import SearchAdopter from "../adoption/SearchAdopter"
import AdopterCard from "../adoption/AdopterCard"

type Props = {
    animalId: string
    entry: AnimalEntry
    onComplete: () => void
    onCancel: () => void
}

type UpdateAnimalEntryFormState = UpdateAnimalEntry & {
    _provincia_detenzione?: string
}

const UpdateAnimalEntryForm = (props: Props) => {
    const { entry, animalId, onComplete, onCancel } = props

    const form = useForm<UpdateAnimalEntryFormState>({
        resolver: zodResolver(updateAnimalEntrySchema),
        defaultValues: {
            entry_date: entry.entry_date,
            entry_type: entry.entry_type,
            exit_date: entry.exit_date,
            exit_type: entry.exit_type,
            entry_notes: entry.entry_notes,
            exit_notes: entry.exit_notes,
            without_chip: entry.without_chip,
            location_address: entry.location_address,
            location_city_code: entry.location_city_code,
            adopter_id: entry.adopter_id,
        },
    })

    const {
        handleSubmit,
        formState: { isValid, isDirty },
        watch,
        setValue,
        register,
    } = form

    const queryClient = useQueryClient()
    const { startLoading, stopLoading } = useLoader()

    // Query data for dropdowns
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()

    const [isDetention, setIsDetention] = useState(false)
    const [selectedAdopter, setSelectedAdopter] = useState<Adopter | null>(null)
    const [adopterCleared, setAdopterCleared] = useState(false)
    const [adopterAction, setAdopterAction] = useState<"search" | null>(null)

    // Detenction location specific fields
    const exitTypeWatch = watch("exit_type")
    useEffect(() => {
        setIsDetention(["A", "R"].includes(exitTypeWatch || ""))
    }, [exitTypeWatch])

    const provinciaDetenzione = watch("_provincia_detenzione")
    const comuneDetenzioneQuery = useComuniQuery(provinciaDetenzione)
    const { data: initialCity } = useComuneQuery(
        entry.location_city_code ?? undefined,
    )

    // Auto-resolve province on mount based on initial city code
    useEffect(() => {
        if (initialCity?.provincia && !provinciaDetenzione) {
            setValue("_provincia_detenzione", initialCity.provincia)
        }
    }, [initialCity, provinciaDetenzione, setValue])

    useEffect(() => {
        register("_provincia_detenzione")
    }, [register])

    const { data: initialAdopter } = useAdopterQuery(
        entry.adopter_id ?? undefined,
    )
    useEffect(() => {
        if (initialAdopter && !selectedAdopter && !adopterCleared) {
            setSelectedAdopter(initialAdopter)
        }
    }, [initialAdopter, selectedAdopter, adopterCleared])

    const updateEntryMutation = useMutation({
        mutationFn: (data: UpdateAnimalEntry) =>
            apiService.updateAnimalEntry(animalId, entry.id, data),
        mutationKey: ["update-animal-entry", animalId, entry.id],
        onMutate: () => {
            startLoading()
        },
        onSettled: () => {
            stopLoading()
        },
        onSuccess: () => {
            // Invalidate animal entries query to refresh the list
            queryClient.invalidateQueries(["animal", animalId])
            queryClient.invalidateQueries(["animal-entries", animalId])
            queryClient.invalidateQueries(["animal-documents", animalId])
            onComplete()
        },
        onError: (error) => {
            console.error("Error updating animal entry:", error)
        },
    })

    const onSubmit = (data: UpdateAnimalEntryFormState) => {
        // Only send fields that have been changed
        const changes: Partial<UpdateAnimalEntry> = {}

        if (data.entry_date !== entry.entry_date)
            changes.entry_date = data.entry_date
        if (data.entry_type !== entry.entry_type)
            changes.entry_type = data.entry_type
        if (data.exit_date !== entry.exit_date)
            changes.exit_date = data.exit_date
        if (data.exit_type !== entry.exit_type)
            changes.exit_type = data.exit_type
        if (data.entry_notes !== entry.entry_notes)
            changes.entry_notes = data.entry_notes
        if (data.exit_notes !== entry.exit_notes)
            changes.exit_notes = data.exit_notes
        if (data.without_chip !== entry.without_chip)
            changes.without_chip = data.without_chip

        // Consider adopter modifications
        if (data.location_address !== entry.location_address)
            changes.location_address = data.location_address
        if (data.location_city_code !== entry.location_city_code)
            changes.location_city_code = data.location_city_code
        if (data.adopter_id !== entry.adopter_id)
            changes.adopter_id = data.adopter_id

        // Only submit if there are actual changes
        if (Object.keys(changes).length > 0) {
            updateEntryMutation.mutate(changes as UpdateAnimalEntry)
        } else {
            onCancel()
        }
    }

    // Reset form when entry prop changes
    useEffect(() => {
        form.reset({
            entry_date: entry.entry_date,
            entry_type: entry.entry_type,
            exit_date: entry.exit_date,
            exit_type: entry.exit_type,
            entry_notes: entry.entry_notes,
            exit_notes: entry.exit_notes,
            location_address: entry.location_address,
            location_city_code: entry.location_city_code,
            adopter_id: entry.adopter_id,
        })
    }, [entry, form])

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">
                Modifica Ingresso/Uscita
            </h3>

            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Entry fields */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">
                                Ingresso
                            </h4>

                            <ControlledInputDate<UpdateAnimalEntryFormState>
                                fieldName="entry_date"
                                label="Data ingresso"
                                className="w-full"
                            />

                            <ControlledDropdown
                                fieldName="entry_type"
                                label="Tipo ingresso"
                                optionValue="id"
                                optionLabel="label"
                                options={entryTypesQuery.data || []}
                                className="w-full"
                            />

                            <ControlledCheckbox<UpdateAnimalEntryFormState>
                                fieldName="without_chip"
                                label="Senza chip"
                            />

                            <ControlledTextarea<UpdateAnimalEntryFormState>
                                fieldName="entry_notes"
                                label="Note ingresso"
                                className="w-full"
                            />
                        </div>

                        {/* Exit fields */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">
                                Uscita
                            </h4>

                            <ControlledInputDate<UpdateAnimalEntryFormState>
                                fieldName="exit_date"
                                label="Data uscita"
                                className="w-full"
                            />

                            <ControlledDropdown
                                fieldName="exit_type"
                                label="Tipo uscita"
                                optionValue="id"
                                optionLabel="label"
                                options={exitTypesQuery.data || []}
                                className="w-full"
                            />

                            <ControlledTextarea<UpdateAnimalEntryFormState>
                                fieldName="exit_notes"
                                label="Note uscita"
                                className="w-full"
                            />

                            {isDetention && (
                                <div className="mt-4 border-t pt-4 border-gray-200">
                                    <h4 className="font-medium text-gray-700 mb-2">
                                        Dettagli Adozione/Detenzione
                                    </h4>

                                    <div className="space-y-4">
                                        <ControlledInputText
                                            label="Indirizzo di detenzione"
                                            fieldName="location_address"
                                            className="w-full"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <UncontrolledProvinceDropdown
                                                label="Provincia detenzione"
                                                onChange={(value) =>
                                                    setValue(
                                                        "_provincia_detenzione",
                                                        value,
                                                    )
                                                }
                                                value={provinciaDetenzione}
                                                className="w-full"
                                            />
                                            <ControlledDropdown
                                                label="Comune detenzione"
                                                disabled={
                                                    !comuneDetenzioneQuery.data
                                                }
                                                optionLabel="name"
                                                optionValue="id"
                                                options={
                                                    comuneDetenzioneQuery.data ||
                                                    []
                                                }
                                                fieldName="location_city_code"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                                            Adottante
                                        </h5>
                                        {selectedAdopter ? (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-green-800 font-medium text-sm">
                                                        ✓ Adottante Selezionato
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedAdopter(
                                                                null,
                                                            )
                                                            setAdopterCleared(
                                                                true,
                                                            )
                                                            setValue(
                                                                "adopter_id",
                                                                undefined,
                                                            )
                                                            setAdopterAction(
                                                                "search",
                                                            )
                                                        }}
                                                        text
                                                        severity="secondary"
                                                        size="small"
                                                        className="text-xs"
                                                    >
                                                        Cambia
                                                    </Button>
                                                </div>
                                                <AdopterCard
                                                    data={selectedAdopter}
                                                    variant="selected"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        setAdopterAction(
                                                            adopterAction ===
                                                                "search"
                                                                ? null
                                                                : "search",
                                                        )
                                                    }
                                                    outlined
                                                    severity="info"
                                                    size="small"
                                                >
                                                    Cerca Adottante
                                                </Button>

                                                {adopterAction === "search" && (
                                                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                                                        <SearchAdopter
                                                            onSelected={(a) => {
                                                                setValue(
                                                                    "adopter_id",
                                                                    a.id,
                                                                    {
                                                                        shouldDirty: true,
                                                                        shouldValidate: true,
                                                                    },
                                                                )
                                                                setSelectedAdopter(
                                                                    a,
                                                                )
                                                                setAdopterCleared(
                                                                    false,
                                                                )
                                                                setAdopterAction(
                                                                    null,
                                                                )
                                                            }}
                                                            onNoResultsCallback={() =>
                                                                null
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 justify-end mt-6">
                        <Button
                            type="button"
                            label="Annulla"
                            severity="secondary"
                            outlined
                            onClick={onCancel}
                        />
                        <Button
                            type="submit"
                            label="Salva modifiche"
                            severity="warning"
                            disabled={
                                !isValid ||
                                updateEntryMutation.isLoading ||
                                (!isDirty &&
                                    entry.adopter_id ===
                                        form.getValues("adopter_id"))
                            }
                            loading={updateEntryMutation.isLoading}
                        />
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}

export default UpdateAnimalEntryForm
