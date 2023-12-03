import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Divider } from "primereact/divider"
import { Toast } from "primereact/toast"
import { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { useLocation, useParams } from "react-router-dom"
import { apiService } from "../../main"
import { AnimalEdit, animalEditSchema } from "../../models/animal.schema"
import { useAnimalQuery } from "../../queries"
import ControlledBreedsDropdown from "../forms/ControlledBreedsDropdown"
import ControlledCheckbox from "../forms/ControlledCheckbox"
import ControlledInputDate from "../forms/ControlledInputDate"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledRadio from "../forms/ControlledRadio"
import ControlledTextarea from "../forms/ControlledTextarea"

const AnimalEditForm = () => {
    const { id } = useParams()
    const location = useLocation()
    const animalQuery = useAnimalQuery(id!)
    const form = useForm<AnimalEdit>({
        resolver: zodResolver(animalEditSchema),
        defaultValues: { ...animalEditSchema.parse(animalQuery.data) },
    })
    const toast = useRef<Toast>(null)

    const {
        formState: { errors },
        handleSubmit,
        watch,
        setValue,
    } = form

    useEffect(() => {
        console.log(watch())
    }, [watch()])
    const queryClient = useQueryClient()

    const updateAnimalMutation = useMutation({
        mutationFn: (args: { id: string; data: AnimalEdit }) =>
            apiService.updateAnimal(args.id, args.data),
        onSuccess: (
            result: boolean,
            variables: { id: string; data: AnimalEdit },
            context
        ) => {
            queryClient.setQueryData(["animal", variables.id], variables.data)
            toast.current?.show({
                severity: "success",
                summary: "Scheda aggiornata",
            })
        },
        onError: () =>
            toast.current?.show({
                severity: "error",
                summary: "Qualcosa è andato storto",
            }),
        mutationKey: "updateAnimal",
    })
    const onSubmit = async (data: AnimalEdit) => {
        if (!id) {
            return false
        }
        await updateAnimalMutation.mutateAsync({ id, data })
        await apiService.updateAnimal(id, data)
    }

    return (
        <div>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit, (e) => console.log(e))}>
                    <div>
                        <h3 className="font-bold">Dati generali</h3>
                        <div className="pb-4 flex flex-col gap-2">
                            <ControlledInputText<AnimalEdit>
                                fieldName="name"
                                label="Nome"
                                className="w-52"
                            />
                            <ControlledInputText<AnimalEdit>
                                fieldName="chip_code"
                                label="Chip"
                                disabled={animalQuery.data?.chip_code_set}
                                className="w-52"
                            />
                            <div className="flex gap-4">
                                <ControlledInputDate<AnimalEdit>
                                    fieldName="entry_date"
                                    label="Data ingresso"
                                    className="w-32"
                                />
                                {/* <ControlledDropdown<AnimalEdit, ProvinciaSchema>
                                    options={[{ name: "Test", id: "1" }]}
                                    optionLabel="name"
                                    optionValue="id"
                                    fieldName="rescue_province"
                                    label="Provincia ritrovamento"
                                    disabled
                                    className="w-52"
                                /> */}
                            </div>
                            <div className="flex flex-row gap-4 py-2">
                                <ControlledCheckbox<AnimalEdit>
                                    fieldName="sterilized"
                                    label="Sterilizzato"
                                />
                                <ControlledRadio<AnimalEdit, number>
                                    fieldName="sex"
                                    values={[
                                        { value: 0, label: "Maschio" },
                                        { value: 1, label: "Femmina" },
                                    ]}
                                />
                                <ControlledInputDate<AnimalEdit>
                                    fieldName="birth_date"
                                    label="Data di nascita"
                                    className="w-32"
                                />
                            </div>
                            <ControlledBreedsDropdown
                                raceId={location.state.race_id}
                            />
                        </div>
                        <ControlledTextarea<AnimalEdit>
                            fieldName="notes"
                            label="Note"
                            className="max-w-md"
                        />
                    </div>
                    <Divider />
                    <Button type="submit">Salva</Button>
                </form>
            </FormProvider>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalEditForm
