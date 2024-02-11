import { FormProvider, useForm } from "react-hook-form"
import { AnimalExit, animalExitSchema } from "../../models/animal.schema"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputDate from "../forms/ControlledInputDate"
import { Button } from "primereact/button"
import { useEffect, useRef } from "react"
import { useAnimalQuery, useExitTypesQuery } from "../../queries"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import { Toast } from "primereact/toast"
import { useParams } from "react-router-dom"

type Props = {
    animal_id: number
}
const AnimalExitForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)

    const queryClient = useQueryClient()

    const toast = useRef<Toast>(null)

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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["animal-search"],
            })
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
    } = form
    const onSubmit = (data: AnimalExit) => {
        animalExitMutation.mutate(data)
    }
    useEffect(() => {
        console.log(errors, watch())
    }, [watch()])
    return (
        <div>
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
                    <Button disabled={!isValid} type="submit">
                        Salva
                    </Button>
                </form>
            </FormProvider>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalExitForm
