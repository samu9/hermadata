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
import { useLoader } from "../../contexts/Loader"
import { useEntryTypesQuery, useExitTypesQuery } from "../../queries"
import { useEffect } from "react"

type Props = {
    animalId: string
    entry: AnimalEntry
    onComplete: () => void
    onCancel: () => void
}

const UpdateAnimalEntryForm = (props: Props) => {
    const { entry, animalId, onComplete, onCancel } = props

    const form = useForm<UpdateAnimalEntry>({
        resolver: zodResolver(updateAnimalEntrySchema),
        defaultValues: {
            entry_date: entry.entry_date,
            entry_type: entry.entry_type,
            exit_date: entry.exit_date,
            exit_type: entry.exit_type,
            entry_notes: entry.entry_notes,
            exit_notes: entry.exit_notes,
        },
    })

    const queryClient = useQueryClient()
    const { startLoading, stopLoading } = useLoader()

    // Query data for dropdowns
    const entryTypesQuery = useEntryTypesQuery()
    const exitTypesQuery = useExitTypesQuery()

    const updateEntryMutation = useMutation({
        mutationFn: (data: UpdateAnimalEntry) =>
            apiService.updateAnimalEntry(animalId, entry.entry_id, data),
        mutationKey: ["update-animal-entry", animalId, entry.entry_id],
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
            onComplete()
        },
        onError: (error) => {
            console.error("Error updating animal entry:", error)
        },
    })

    const onSubmit = (data: UpdateAnimalEntry) => {
        // Only send fields that have been changed
        const changes: Partial<UpdateAnimalEntry> = {}

        if (data.entry_date !== entry.entry_date) {
            changes.entry_date = data.entry_date
        }
        if (data.entry_type !== entry.entry_type) {
            changes.entry_type = data.entry_type
        }
        if (data.exit_date !== entry.exit_date) {
            changes.exit_date = data.exit_date
        }
        if (data.exit_type !== entry.exit_type) {
            changes.exit_type = data.exit_type
        }
        if (data.entry_notes !== entry.entry_notes) {
            changes.entry_notes = data.entry_notes
        }
        if (data.exit_notes !== entry.exit_notes) {
            changes.exit_notes = data.exit_notes
        }

        // Only submit if there are actual changes
        if (Object.keys(changes).length > 0) {
            updateEntryMutation.mutate(changes as UpdateAnimalEntry)
        } else {
            onCancel()
        }
    }

    const {
        handleSubmit,
        formState: { isValid, isDirty },
    } = form

    // Reset form when entry prop changes
    useEffect(() => {
        form.reset({
            entry_date: entry.entry_date,
            entry_type: entry.entry_type,
            exit_date: entry.exit_date,
            exit_type: entry.exit_type,
            entry_notes: entry.entry_notes,
            exit_notes: entry.exit_notes,
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

                            <ControlledInputDate<UpdateAnimalEntry>
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

                            <ControlledTextarea<UpdateAnimalEntry>
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

                            <ControlledInputDate<UpdateAnimalEntry>
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

                            <ControlledTextarea<UpdateAnimalEntry>
                                fieldName="exit_notes"
                                label="Note uscita"
                                className="w-full"
                            />
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
                                !isDirty ||
                                !isValid ||
                                updateEntryMutation.isLoading
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
