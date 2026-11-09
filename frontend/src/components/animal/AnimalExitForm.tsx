import { FormProvider, useForm } from "react-hook-form"
import {
    Animal,
    AnimalExit,
    animalExitSchema,
} from "../../models/animal.schema"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputDate from "../forms/ControlledInputDate"
import { Checkbox } from "primereact/checkbox"
import { useEffect, useRef, useState } from "react"
import {
    useAnimalQuery,
    useExitTypesQuery,
    useAdopterQuery,
} from "../../queries"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { Toast } from "primereact/toast"
import { useParams } from "react-router-dom"
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons"
import ControlledTextarea from "../forms/ControlledTextarea"
import { useLoader } from "../../contexts/Loader"
import { Adopter } from "../../models/adopter.schema"
import { useFormPersist } from "../../hooks/useFormPersist"
import { useToolbar } from "../../contexts/Toolbar"
import ExitDetentionSteps from "./ExitDetentionSteps"
import { filterExitTypesByRace } from "../../utils/exitTypes"

const AnimalExitForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    const queryClient = useQueryClient()

    const toast = useRef<Toast>(null)

    const [selectedAdopter, setSelectedAdopter] = useState<Adopter | null>(null)
    const [isTemporary, setIsTemporary] = useState(false)
    const { startLoading, stopLoading } = useLoader()

    const exitTypesQuery = useExitTypesQuery()
    // Filter out "temporary_adoption" (T) from the dropdown - it's handled via
    // the checkbox - and the exit types not available for the animal's race
    const exitTypesForDropdown = filterExitTypesByRace(
        exitTypesQuery.data,
        animalQuery.data?.race_id,
    ).filter((t) => t.id !== "T")
    const form = useForm<AnimalExit>({
        resolver: zodResolver(animalExitSchema),
        defaultValues: {
            animal_id: parseInt(id!),
            exit_date: animalQuery.data?.exit_date,
            exit_type: animalQuery.data?.exit_type || undefined,
        },
    })

    const {
        handleSubmit,
        watch,
        formState: { isValid, errors },
        getValues,
        setValue,
        reset,
    } = form

    const adopterId = watch("adopter_id")
    const adopterQuery = useAdopterQuery(adopterId)

    useEffect(() => {
        if (adopterQuery.data) {
            setSelectedAdopter(adopterQuery.data)
        } else if (!adopterId) {
            setSelectedAdopter(null)
        }
    }, [adopterQuery.data, adopterId])

    const onAdopterSelected = (adopter: Adopter | null) => {
        setSelectedAdopter(adopter)
        setValue("adopter_id", adopter?.id, {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    const animalExitMutation = useMutation({
        mutationFn: (data: AnimalExit) => apiService.animalExit(data),
        onMutate: () => startLoading(),
        onSettled: () => stopLoading(),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["animal-search"],
            })
            //@ts-ignore: types Updater and Animal are not compatible
            queryClient.setQueryData(["animal", id], (old: Animal) => ({
                ...old,
                exit_date: variables.exit_date,
                exit_type: variables.exit_type,
            }))
            toast.current?.show({
                severity: "success",
                summary: "Uscita completata",
            })
        },
    })

    const { clearStorage } = useFormPersist(`animal-exit-form-${id}`, form)

    const onSubmit = (data: AnimalExit) => {
        // When adoption and temporary checkbox is checked, use "T" exit type
        const submitData: AnimalExit = {
            ...data,
            exit_type:
                data.exit_type === "A" && isTemporary ? "T" : data.exit_type,
        }
        animalExitMutation.mutate(submitData, {
            onSuccess: () => {
                clearStorage()
                reset()
            },
        })
    }

    const { addButton, removeButton } = useToolbar()
    useEffect(() => {
        addButton({
            id: "save-exit",
            group: "page",
            buttonText: "Salva Uscita",
            buttonIcon: faDoorOpen,
            disabled: !isValid || animalExitMutation.isLoading,
            loading: animalExitMutation.isLoading,
            order: 100,
            onClick: () => handleSubmit(onSubmit)(),
        })
        return () => removeButton("save-exit")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isValid,
        isTemporary,
        animalExitMutation.isLoading,
        addButton,
        removeButton,
    ])

    const [isAdoption, setIsAdoption] = useState(false)
    const [isDetention, setIsDetention] = useState(false)
    useEffect(() => {
        const values = getValues()
        const isAdoptionType = values.exit_type === "A"
        setIsAdoption(isAdoptionType)
        if (!isAdoptionType) {
            setIsTemporary(false)
        }
        setIsDetention(["A", "R"].includes(values.exit_type))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch("exit_type")])
    return (
        <div className="max-w-6xl mx-auto p-6">
            <FormProvider {...form}>
                {/* Not a <form>: saving goes through the toolbar, and the
                    adopter step embeds its own forms. */}
                <div className="space-y-6">
                    {/* Basic Exit Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Informazioni Uscita
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ControlledInputDate<AnimalExit>
                                fieldName="exit_date"
                                label="Data uscita"
                                className="w-full"
                            />
                            <ControlledDropdown
                                fieldName="exit_type"
                                label="Tipo uscita"
                                optionValue="id"
                                optionLabel="label"
                                options={exitTypesForDropdown}
                                className="w-full"
                            />
                        </div>
                        {isAdoption && (
                            <div className="flex items-center gap-3 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <Checkbox
                                    inputId="temporary-adoption"
                                    checked={isTemporary}
                                    onChange={(e) =>
                                        setIsTemporary(e.checked ?? false)
                                    }
                                />
                                <label
                                    htmlFor="temporary-adoption"
                                    className="text-amber-800 font-medium cursor-pointer"
                                >
                                    Temporaneo
                                </label>
                                {isTemporary && (
                                    <span className="text-xs text-amber-600 ml-2">
                                        Verrà generato un documento di adozione
                                        temporanea
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {isDetention && (
                        <ExitDetentionSteps
                            selectedAdopter={selectedAdopter}
                            onAdopterSelected={onAdopterSelected}
                        />
                    )}

                    {/* Notes Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Note Aggiuntive
                        </h3>
                        <ControlledTextarea
                            fieldName="notes"
                            label="Note"
                            className="w-full"
                        />
                    </div>
                </div>
            </FormProvider>

            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalExitForm
