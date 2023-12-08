import { useForm, FormProvider } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { apiService } from "../main"
import ControlledInputText from "./forms/ControlledInputText"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import {
    NewBreed as NewBreed,
    Breed,
    addBreedSchema,
} from "../models/breed.schema"
import { Updater } from "react-query/types/core/utils"
import ControlledRacesDropdown from "./forms/ControlledRacesDropdown"
import { SubTitle } from "./typography"

type Props = {
    raceId?: string
    onSuccess?: (result: Breed) => void
}
const AddBreedForm = (props: Props) => {
    const form = useForm<NewBreed>({
        resolver: zodResolver(addBreedSchema),
        defaultValues: {
            race_id: props.raceId,
        },
    })

    const {
        handleSubmit,
        setError,
        formState: { errors },
    } = form
    const queryClient = useQueryClient()

    // React Query Mutation for API call
    const createBreed = useMutation({
        mutationFn: (newBreed: NewBreed) => apiService.addBreed(newBreed),
        onSuccess: (result: Breed, variables: NewBreed, context) => {
            queryClient.setQueryData(
                ["breeds", variables.race_id],
                //@ts-ignore
                (old: Updater<Breed[], Breed[]>) => [...old, result]
            )
            props.onSuccess && props.onSuccess(result)
        },
        mutationKey: "newBreed",
    })

    // Handle form submission
    const onSubmit = async (data: NewBreed) => {
        try {
            // Make API call to create a new dog breed
            await createBreed.mutateAsync(data)
            // Optionally, you can handle success (e.g., show a success message)
        } catch (error) {
            // Handle API error, and set specific form field errors if needed
            setError("name", {
                type: "manual",
                message: "Nome non valido.",
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SubTitle>Aggiungi una razza</SubTitle>
            <FormProvider {...form}>
                <div className="flex flex-col gap-2 items-start">
                    <ControlledRacesDropdown />
                    <ControlledInputText<NewBreed>
                        fieldName="name"
                        label="Nome"
                        className="w-full"
                    />
                    <Button type="button" onClick={handleSubmit(onSubmit)}>
                        <FontAwesomeIcon
                            icon={faPlus}
                            fixedWidth
                            className="pr-2"
                        />{" "}
                        Aggiungi
                    </Button>
                </div>
            </FormProvider>
        </form>
    )
}

export default AddBreedForm
