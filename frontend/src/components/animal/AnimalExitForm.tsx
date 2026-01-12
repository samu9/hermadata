import { FormProvider, useForm } from "react-hook-form"
import {
    Animal,
    AnimalExit,
    animalExitSchema,
} from "../../models/animal.schema"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputDate from "../forms/ControlledInputDate"
import { Button } from "primereact/button"
import { useEffect, useRef, useState } from "react"
import {
    useAnimalQuery,
    useComuniQuery,
    useExitTypesQuery,
    useAdopterQuery,
} from "../../queries"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { Toast } from "primereact/toast"
import { useParams } from "react-router-dom"
import SearchAdopter from "../adoption/SearchAdopter"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAdd, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import NewAdopterForm from "../adopter/NewAdopterForm"
import { Dialog } from "primereact/dialog"
import ControlledTextarea from "../forms/ControlledTextarea"
import { useLoader } from "../../contexts/Loader"
import AdopterCard from "../adoption/AdopterCard"
import { Adopter } from "../../models/adopter.schema"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"
import ControlledInputText from "../forms/ControlledInputText"
import { useFormPersist } from "../../hooks/useFormPersist"

type AnimalExitFormState = AnimalExit & {
    _provincia_detenzione?: string
}

const AnimalExitForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    const queryClient = useQueryClient()

    const toast = useRef<Toast>(null)

    const [selectedAdopter, setSelectedAdopter] = useState<Adopter | null>(null)
    const [dialogVisibile, setDialogVisible] = useState(false)
    const [adopterAction, setAdopterAction] = useState<"add" | "search">(
        "search"
    )
    const { startLoading, stopLoading } = useLoader()

    const exitTypesQuery = useExitTypesQuery()
    const form = useForm<AnimalExitFormState>({
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
        register,
    } = form

    // Register UI state fields so they are persisted
    useEffect(() => {
        register("_provincia_detenzione")
    }, [register])

    const provinciaDetenzione = watch("_provincia_detenzione")
    const comuneDetenzioneQuery = useComuniQuery(provinciaDetenzione)

    const adopterId = watch("adopter_id")
    const adopterQuery = useAdopterQuery(adopterId)

    useEffect(() => {
        if (adopterQuery.data) {
            setSelectedAdopter(adopterQuery.data)
        } else if (!adopterId) {
            setSelectedAdopter(null)
        }
    }, [adopterQuery.data, adopterId])

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
        animalExitMutation.mutate(data, {
            onSuccess: () => {
                clearStorage()
                reset()
            },
        })
    }

    const [isDetention, setIsDetention] = useState(false)
    useEffect(() => {
        const values = getValues()
        // console.log(values, isValid, errors)
        setIsDetention(["A", "R"].includes(values.exit_type))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch("exit_type")]) 
    return (
        <div className="max-w-6xl mx-auto p-6">
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Exit Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Informazioni Uscita
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ControlledInputDate<AnimalExit>
                                fieldName="exit_date"
                                label="Data uscita"
                                disabled={true}
                                className="w-full"
                            />
                            <ControlledDropdown
                                fieldName="exit_type"
                                label="Tipo uscita"
                                optionValue="id"
                                optionLabel="label"
                                options={exitTypesQuery.data}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Detention Details - Only shown when exit type is detention */}
                    {isDetention && (
                        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                Dettagli Detenzione
                            </h3>

                            {/* Location Information */}
                            <div className="space-y-4">
                                <ControlledInputText
                                    label="Indirizzo di detenzione"
                                    fieldName="location_address"
                                    className="w-full"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <UncontrolledProvinceDropdown
                                        label="Provincia di detenzione"
                                        onChange={(value) =>
                                            setValue(
                                                "_provincia_detenzione",
                                                value
                                            )
                                        }
                                        value={provinciaDetenzione}
                                        className="w-full"
                                    />
                                    <ControlledDropdown
                                        label="Comune di detenzione"
                                        disabled={!comuneDetenzioneQuery.data}
                                        optionLabel="name"
                                        optionValue="id"
                                        options={comuneDetenzioneQuery.data}
                                        fieldName="location_city_code"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Adopter Section */}
                            <div className="mt-6">
                                <h4 className="text-md font-medium text-blue-800 mb-3">
                                    Adottante
                                </h4>

                                {/* Selected Adopter Card */}
                                {selectedAdopter && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-green-800 font-medium text-sm">
                                                ✓ Adottante Selezionato
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedAdopter(null)
                                                    setValue(
                                                        "adopter_id",
                                                        undefined
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
                                )}

                                {/* Adopter Search/Add Actions */}
                                {!selectedAdopter && (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setAdopterAction("search")
                                                }
                                                outlined={
                                                    adopterAction !== "search"
                                                }
                                                severity={
                                                    adopterAction === "search"
                                                        ? "info"
                                                        : "secondary"
                                                }
                                                className="flex-1 sm:flex-none"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                    className="mr-2"
                                                />
                                                Cerca Adottante
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setDialogVisible(true)
                                                }
                                                outlined
                                                severity="success"
                                                className="flex-1 sm:flex-none"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faAdd}
                                                    className="mr-2"
                                                />
                                                Nuovo Adottante
                                            </Button>
                                        </div>

                                        {/* Search Component */}
                                        {adopterAction === "search" && (
                                            <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                                <SearchAdopter
                                                    onSelected={(a) => {
                                                        setValue(
                                                            "adopter_id",
                                                            a.id,
                                                            {
                                                                shouldDirty:
                                                                    true,
                                                                shouldValidate:
                                                                    true,
                                                            }
                                                        )
                                                        setSelectedAdopter(a)
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

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            disabled={!isValid}
                            type="submit"
                            size="large"
                            className="px-8"
                        >
                            Salva Uscita
                        </Button>
                    </div>
                </form>
            </FormProvider>

            {/* Add Adopter Dialog */}
            <Dialog
                visible={dialogVisibile}
                className="w-full max-w-4xl"
                header="Aggiungi Nuovo Adottante"
                onHide={() => setDialogVisible(false)}
                modal
            >
                <NewAdopterForm
                    onSaved={(a) => {
                        setValue("adopter_id", a.id, {
                            shouldDirty: true,
                            shouldValidate: true,
                        })
                        setSelectedAdopter(a)
                        setDialogVisible(false)
                    }}
                />
            </Dialog>

            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalExitForm
