import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { Divider } from "primereact/divider"
import { Toast } from "primereact/toast"
import { useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { Link, useParams } from "react-router-dom"
import { ApiErrorCode } from "../../constants"
import { apiService } from "../../main"
import { AnimalEdit, animalEditSchema } from "../../models/animal.schema"
import { ApiError, apiErrorSchema } from "../../models/api.schema"
import {
    useAnimalFurTypesQuery,
    useAnimalQuery,
    useAnimalSizesQuery,
} from "../../queries"
import ControlledBreedsDropdown from "../forms/ControlledBreedsDropdown"
import ControlledCheckbox from "../forms/ControlledCheckbox"
import ControlledDropdown from "../forms/ControlledDropdown"
import ControlledInputDate from "../forms/ControlledInputDate"
import ControlledInputMask from "../forms/ControlledInputMask"
import ControlledInputText from "../forms/ControlledInputText"
import ControlledRadio from "../forms/ControlledRadio"
import ControlledTextarea from "../forms/ControlledTextarea"

const AnimalEditForm = () => {
    const { id } = useParams()
    const animalQuery = useAnimalQuery(id!)
    const animalSizesQuery = useAnimalSizesQuery()
    const animalFurTypesQuery = useAnimalFurTypesQuery()
    const form = useForm<AnimalEdit>({
        resolver: zodResolver(animalEditSchema),
        defaultValues: {
            ...animalEditSchema.parse(animalQuery.data),
        },
    })
    const toast = useRef<Toast>(null)

    const {
        formState: { errors, isDirty },
        handleSubmit,
        reset,
        setValue,
    } = form

    const queryClient = useQueryClient()

    const updateAnimalMutation = useMutation({
        mutationFn: (args: { id: string; data: AnimalEdit }) =>
            apiService.updateAnimal(args.id, args.data),
        onSuccess: (
            result: boolean | ApiError,
            variables: { id: string; data: AnimalEdit },
            context
        ) => {
            const isApiError = apiErrorSchema.safeParse(result)
            console.log(isApiError)
            if (isApiError.success) {
                if (isApiError.data.code == ApiErrorCode.existingChipCode) {
                    const otherAnimalId = isApiError.data.content!.animal_id
                    toast.current?.show({
                        severity: "warn",
                        sticky: true,

                        content: (
                            <div className="flex gap-3 w-full items-start">
                                <i className="text-[2rem] pi pi-exclamation-triangle" />
                                <div className="flex flex-col gap-1 w-full">
                                    <span className="p-toast-summary">
                                        Chip già esistente
                                    </span>
                                    <Link
                                        className="underline"
                                        to={"/animal/" + otherAnimalId}
                                    >
                                        Vai alla scheda dell'animale
                                    </Link>
                                </div>
                            </div>
                        ),
                    })
                }
                return
            }
            queryClient.invalidateQueries({
                queryKey: ["animal-search"],
            })
            queryClient.setQueryData(
                ["animal", variables.id],
                //@ts-ignore: types Updater and Animal are not compatible
                (old: Animal) => ({
                    ...old,
                    ...variables.data,
                })
            )
            toast.current?.show({
                severity: "success",
                summary: "Scheda aggiornata",
            })
            reset(variables.data)
        },
        onError: (error) =>
            toast.current?.show({
                severity: "error",
                summary: "Qualcosa è andato storto",
            }),
        mutationKey: "update-animal",
    })
    const onSubmit = async (data: AnimalEdit) => {
        if (!id) {
            return false
        }
        await updateAnimalMutation.mutateAsync({ id, data })
    }

    return (
        <div>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <div className="pb-4 flex flex-col gap-2">
                            <ControlledInputText<AnimalEdit>
                                fieldName="name"
                                label="Nome"
                                className="w-52"
                            />
                            <div className="flex gap-4">
                                <ControlledInputMask<AnimalEdit>
                                    fieldName="chip_code"
                                    label="Chip"
                                    mask="999.999.999.999.999"
                                    disabled={animalQuery.data?.chip_code_set}
                                    className="w-52"
                                />
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
                                raceId={animalQuery.data?.race_id}
                                onAddBreed={(breed) =>
                                    setValue("breed_id", breed.id, {
                                        shouldDirty: true,
                                    })
                                }
                            />

                            <div className="flex flex-row gap-4 py-2">
                                <ControlledDropdown
                                    fieldName="size"
                                    label="Taglia"
                                    optionValue="id"
                                    optionLabel="label"
                                    options={animalSizesQuery.data}
                                />

                                <ControlledDropdown
                                    fieldName="fur"
                                    label="Pelo"
                                    optionValue="id"
                                    optionLabel="label"
                                    options={animalFurTypesQuery.data}
                                />
                            </div>
                        </div>
                        <ControlledTextarea<AnimalEdit>
                            fieldName="notes"
                            label="Note"
                            className="max-w-md"
                        />
                    </div>
                    <Divider />
                    <Button disabled={!isDirty} type="submit">
                        Salva
                    </Button>
                </form>
            </FormProvider>
            <Toast ref={toast} position="bottom-right" />
        </div>
    )
}

export default AnimalEditForm
