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
import { useAnimalQuery, useExitTypesQuery } from "../../queries"
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

const AnimalExitForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    const queryClient = useQueryClient()

    const toast = useRef<Toast>(null)

    const [showAdopterForm, setShowAdopterForm] = useState(false)
    const [dialogVisibile, setDialogVisible] = useState(false)
    const [adopterAction, setAdopterAction] = useState<"add" | "search">(
        "search"
    )

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
    useEffect(() => {
        const values = getValues()

        setShowAdopterForm(
            [
                "A",
                //, "R"
            ].includes(values.exit_type)
        )
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
                        <ControlledTextarea fieldName="notes" label="Note" />
                        <Button disabled={!isValid} type="submit">
                            Salva
                        </Button>
                    </form>
                </FormProvider>
                {showAdopterForm && (
                    <div className="border rounded p-4 shadow w-full">
                        <SubTitle>Adottante</SubTitle>

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
                                onSelected={(a) =>
                                    setValue("adopter_id", a.id, {
                                        shouldDirty: true,
                                    })
                                }
                                onNoResultsCallback={() => null}
                            />
                        )}
                    </div>
                )}
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
