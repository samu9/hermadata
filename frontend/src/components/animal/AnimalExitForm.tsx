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
} from "../../queries"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { Toast } from "primereact/toast"
import { useParams } from "react-router-dom"
import SearchAdopter from "../adoption/SearchAdopter"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAdd, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { SubTitle } from "../typography"
import NewAdopterForm from "../adopter/NewAdopterForm"
import { Dialog } from "primereact/dialog"
import ControlledTextarea from "../forms/ControlledTextarea"
import { useLoader } from "../../contexts/Loader"
import AdopterCard from "../adoption/AdopterCard"
import { Adopter } from "../../models/adopter.schema"
import UncontrolledProvinceDropdown from "../forms/uncontrolled/UncontrolledProvinceDropdown"
import ControlledInputText from "../forms/ControlledInputText"

const AnimalExitForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    const queryClient = useQueryClient()

    const [provinciaDetenzione, setProvinciaDetenzione] = useState<string>()
    const comuneDetenzioneQuery = useComuniQuery(provinciaDetenzione)

    const toast = useRef<Toast>(null)

    const [selectedAdopter, setSelectedAdopter] = useState<Adopter | null>(null)
    const [dialogVisibile, setDialogVisible] = useState(false)
    const [adopterAction, setAdopterAction] = useState<"add" | "search">(
        "search"
    )
    const { startLoading, stopLoading } = useLoader()

    const exitTypesQuery = useExitTypesQuery()
    const form = useForm<AnimalExit>({
        resolver: zodResolver(animalExitSchema),
        defaultValues: {
            animal_id: parseInt(id!),
            exit_date: animalQuery.data?.exit_date,
            exit_type: animalQuery.data?.exit_type || undefined,
        },
    })

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

    const {
        handleSubmit,
        watch,
        formState: { isValid, errors },
        getValues,
        setValue,
        reset,
    } = form
    const onSubmit = (data: AnimalExit) => {
        animalExitMutation.mutate(data, { onSuccess: () => reset() })
    }

    const [isDetention, setIsDetention] = useState(false)
    useEffect(() => {
        const values = getValues()
        console.log(values, isValid, errors)
        setIsDetention(["A", "R"].includes(values.exit_type))
    }, [watch()])
    return (
        <div>
            <div className="flex gap-3">
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex gap-2 mb-2">
                            <ControlledInputDate<AnimalExit>
                                fieldName="exit_date"
                                label="Data uscita"
                                disabled={true}
                                className="w-32"
                            />
                            <ControlledDropdown
                                fieldName="exit_type"
                                label="Tipo uscita"
                                optionValue="id"
                                optionLabel="label"
                                options={exitTypesQuery.data}
                            />
                        </div>
                        <ControlledInputText
                            label="Indirizzo di detenzione"
                            fieldName="location_address"
                            disabled={!isDetention}
                        />
                        <div className="flex gap-2">
                            <UncontrolledProvinceDropdown
                                label="Provincia di detenzione"
                                onChange={(value) =>
                                    setProvinciaDetenzione(value)
                                }
                                disabled={!isDetention}
                                className="w-64"
                            />
                            <ControlledDropdown
                                label="Comune di detenzione"
                                disabled={
                                    !comuneDetenzioneQuery.data || !isDetention
                                }
                                optionLabel="name"
                                optionValue="id"
                                options={comuneDetenzioneQuery.data}
                                fieldName="location_city_code"
                                className="w-64"
                            />
                        </div>
                        <ControlledTextarea fieldName="notes" label="Note" />
                        <Button disabled={!isValid} type="submit">
                            Salva
                        </Button>
                    </form>
                </FormProvider>
                <div className="flex flex-col w-full gap-2">
                    {selectedAdopter && isDetention && (
                        <div>
                            <AdopterCard data={selectedAdopter} />
                        </div>
                    )}
                    {isDetention && (
                        <div className="border rounded p-4 shadow w-full">
                            <SubTitle>Cerca o aggiungi adottante</SubTitle>

                            <div className="flex gap-2 mb-2 items-center w-full justify-center">
                                <Button
                                    onClick={() => {
                                        setAdopterAction("search")
                                    }}
                                    disabled={adopterAction == "search"}
                                >
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </Button>
                                <Button
                                    onClick={() => setDialogVisible(true)}
                                    disabled={adopterAction == "add"}
                                >
                                    <FontAwesomeIcon icon={faAdd} />
                                </Button>
                            </div>
                            {adopterAction == "search" && (
                                <SearchAdopter
                                    onSelected={(a) => {
                                        setValue("adopter_id", a.id, {
                                            shouldDirty: true,
                                        })
                                        setSelectedAdopter(a)
                                    }}
                                    onNoResultsCallback={() => null}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Dialog
                visible={dialogVisibile}
                className="w-2/3"
                header={"Aggiungi adottante"}
                onHide={() => setDialogVisible(false)}
            >
                <NewAdopterForm
                    onSaved={(a) => {
                        setValue("adopter_id", a.id, {
                            shouldDirty: true,
                        })
                        setDialogVisible(false)
                    }}
                />
            </Dialog>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalExitForm
