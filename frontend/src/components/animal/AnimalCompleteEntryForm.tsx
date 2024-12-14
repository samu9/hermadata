import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "primereact/button"
import { FormProvider, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import { apiService } from "../../main"
import {
    Animal,
    AnimalCompleteEntry,
    animalCompleteEntrySchema,
} from "../../models/animal.schema"
import ControlledInputDate from "../forms/ControlledInputDate"
import { useLoader } from "../../contexts/Loader"

type Props = {
    animal_id: string
    onComplete: () => void
}
const AnimalCompleteEntryForm = (props: Props) => {
    const form = useForm<AnimalCompleteEntry>({
        resolver: zodResolver(animalCompleteEntrySchema),
    })

    const queryClient = useQueryClient()
    const { startLoading, stopLoading } = useLoader()

    const completeEntryMutation = useMutation({
        mutationFn: (data: AnimalCompleteEntry) =>
            apiService.completeAnimalEntry(props.animal_id, data),
        mutationKey: ["complete-animal-entry"],
        onMutate: () => {
            // Start loading before the mutation is executed
            startLoading()
        },
        onSettled: () => {
            // Optionally, ensure loading stops regardless of success or error
            stopLoading()
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(
                ["animal", props.animal_id],
                //@ts-ignore: types Updater and Animal are not compatible
                (old: Animal) => ({
                    ...old,
                    entry_date: variables.entry_date,
                })
            )

            props.onComplete()
        },
    })
    const onSubmit = (data: AnimalCompleteEntry) => {
        completeEntryMutation.mutate(data)
    }
    const { handleSubmit, reset, setValue } = form
    return (
        <div className="">
            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4 items-start"
                >
                    <ControlledInputDate<AnimalCompleteEntry>
                        fieldName="entry_date"
                        label="Data ingresso"
                        className="w-48"
                    />

                    <Button severity="warning">Conferma</Button>
                </form>
            </FormProvider>
        </div>
    )
}

export default AnimalCompleteEntryForm
